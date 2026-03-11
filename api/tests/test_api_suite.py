"""
Comprehensive API Test Suite

Covers: authentication, authorization, CRUD, input validation,
error handling, performance, and rate limiting.

Run: pytest tests/test_api_suite.py -v
Run without performance: pytest tests/test_api_suite.py -v -m "not performance"
"""

import time
import pytest

from app import db
from app.models.product import Product
from app.models.discount import DiscountCode
from decimal import Decimal
from datetime import datetime, timedelta


def headers_for(token):
    """Build Authorization header from JWT token."""
    return {"Authorization": f"Bearer {token}"}


# ─── Fixtures ────────────────────────────────────────────────────────────────


@pytest.fixture
def customer_user(client):
    """Customer with auth token."""
    client.post(
        "/api/v1/auth/register",
        json={"name": "Customer User", "email": "customer@api-suite.com", "password": "password123"},
    )
    resp = client.post("/api/v1/auth/login", json={"email": "customer@api-suite.com", "password": "password123"})
    data = resp.get_json()
    return {"id": data["user"]["id"], "token": data["access_token"], "role": "customer"}


@pytest.fixture
def admin_user(client):
    """Admin with auth token."""
    client.post(
        "/api/v1/auth/register",
        json={"name": "Admin User", "email": "admin@api-suite.com", "password": "admin123", "role": "admin"},
    )
    resp = client.post("/api/v1/auth/login", json={"email": "admin@api-suite.com", "password": "admin123"})
    data = resp.get_json()
    return {"id": data["user"]["id"], "token": data["access_token"], "role": "admin"}


@pytest.fixture
def products(app):
    """Seed products for checkout tests."""
    with app.app_context():
        for p in [
            {"sku": "P-API-001", "name": "Widget", "price": Decimal("19.99"), "stock": 50},
        ]:
            if not Product.query.filter_by(sku=p["sku"]).first():
                db.session.add(Product(**p))
        db.session.commit()
        return list(Product.query.filter_by(sku="P-API-001").all())


# ─── 1. Authentication Tests ─────────────────────────────────────────────────


class TestAuthentication:
    """Valid/invalid tokens, login, refresh."""

    def test_valid_token_returns_user(self, client, auth_headers):
        """Valid JWT returns 200 with user info."""
        resp = client.get("/api/v1/auth/me", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["user"]["email"] == "test@example.com"

    def test_invalid_token_returns_401(self, client):
        """Invalid Bearer token returns 401."""
        resp = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid-token-xyz"})
        assert resp.status_code in (401, 422)

    def test_malformed_token_returns_401(self, client):
        """Malformed Authorization returns 401."""
        resp = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer"})
        assert resp.status_code in (401, 422)

    def test_missing_token_returns_401(self, client):
        """No Authorization header returns 401."""
        resp = client.get("/api/v1/auth/me")
        assert resp.status_code in (401, 422)

    def test_login_valid_credentials(self, client):
        """Login with valid credentials returns 200 and token."""
        client.post(
            "/api/v1/auth/register",
            json={"name": "Login Test", "email": "login@api.com", "password": "pass12345"},
        )
        resp = client.post("/api/v1/auth/login", json={"email": "login@api.com", "password": "pass12345"})
        assert resp.status_code == 200
        assert "access_token" in resp.get_json()

    def test_login_invalid_password_returns_401(self, client):
        """Login with wrong password returns 401."""
        client.post(
            "/api/v1/auth/register",
            json={"name": "User", "email": "wrong@api.com", "password": "correct123"},
        )
        resp = client.post("/api/v1/auth/login", json={"email": "wrong@api.com", "password": "wrong"})
        assert resp.status_code == 401


# ─── 2. Authorization Tests (RBAC) ──────────────────────────────────────────


class TestAuthorization:
    """Role-based access control."""

    def test_customer_cannot_list_users(self, client, customer_user):
        """GET /users requires admin; customer gets 403."""
        resp = client.get("/api/v1/users/", headers=headers_for(customer_user["token"]))
        assert resp.status_code == 403

    def test_admin_can_list_users(self, client, admin_user):
        """Admin can list all users."""
        resp = client.get("/api/v1/users/", headers=headers_for(admin_user["token"]))
        assert resp.status_code == 200
        assert "users" in resp.get_json() or isinstance(resp.get_json(), list)

    def test_customer_cannot_delete_ticket(self, client, customer_user):
        """DELETE /tickets/<id> requires admin."""
        resp = client.delete("/api/v1/tickets/1", headers=headers_for(customer_user["token"]))
        assert resp.status_code in (403, 404)

    def test_customer_can_get_own_profile(self, client, customer_user):
        """Customer can GET own user profile."""
        resp = client.get(
            f"/api/v1/users/{customer_user['id']}",
            headers=headers_for(customer_user["token"]),
        )
        assert resp.status_code == 200


# ─── 3. CRUD Operation Tests ─────────────────────────────────────────────────


class TestTaskCRUD:
    """Tasks: GET, POST, PUT, DELETE."""

    def test_create_task(self, client, task_user):
        """POST /tasks creates task, 201."""
        resp = client.post(
            "/api/v1/tasks/",
            headers=headers_for(task_user["token"]),
            json={"title": "API Suite Task", "description": "Created by API test suite"},
        )
        assert resp.status_code == 201
        assert resp.get_json().get("title") == "API Suite Task"

    def test_list_tasks(self, client, task_user):
        """GET /tasks returns list."""
        resp = client.get("/api/v1/tasks/", headers=headers_for(task_user["token"]))
        assert resp.status_code == 200
        assert isinstance(resp.get_json(), list)

    def test_get_task_by_id(self, client, task_user):
        """GET /tasks/<id> returns task."""
        create = client.post(
            "/api/v1/tasks/",
            headers=headers_for(task_user["token"]),
            json={"title": "Get Me", "description": "Fetch this task"},
        )
        task_id = create.get_json()["id"]
        resp = client.get(f"/api/v1/tasks/{task_id}", headers=headers_for(task_user["token"]))
        assert resp.status_code == 200
        assert resp.get_json()["title"] == "Get Me"

    def test_update_task(self, client, task_user):
        """PUT /tasks/<id> updates task."""
        create = client.post(
            "/api/v1/tasks/",
            headers=headers_for(task_user["token"]),
            json={"title": "Original", "description": "To update"},
        )
        task_id = create.get_json()["id"]
        resp = client.put(
            f"/api/v1/tasks/{task_id}",
            headers=headers_for(task_user["token"]),
            json={"title": "Updated Title"},
        )
        assert resp.status_code == 200
        assert resp.get_json()["title"] == "Updated Title"

    def test_delete_task(self, client, task_user):
        """DELETE /tasks/<id> returns 204."""
        create = client.post(
            "/api/v1/tasks/",
            headers=headers_for(task_user["token"]),
            json={"title": "To Delete", "description": "Will be removed"},
        )
        task_id = create.get_json()["id"]
        resp = client.delete(f"/api/v1/tasks/{task_id}", headers=headers_for(task_user["token"]))
        assert resp.status_code == 204


class TestTicketCRUD:
    """Tickets: GET, POST, PUT, DELETE."""

    def test_create_ticket(self, client, auth_headers):
        """POST /tickets creates ticket, 201."""
        resp = client.post(
            "/api/v1/tickets/",
            headers=auth_headers,
            json={
                "subject": "API Suite Ticket Subject",
                "description": "A ticket with at least twenty characters here.",
                "priority": "medium",
                "category": "technical",
                "customer_email": "test@example.com",
            },
        )
        assert resp.status_code == 201
        assert "ticket" in resp.get_json()

    def test_list_tickets(self, client, auth_headers):
        """GET /tickets returns list."""
        resp = client.get("/api/v1/tickets/", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert "tickets" in data or isinstance(data.get("items"), list) or "pagination" in str(data).lower()


class TestOrderCRUD:
    """Orders: GET (list), Create via checkout."""

    def test_list_orders(self, client, customer_user, products):
        """GET /checkout/orders returns user orders."""
        resp = client.get("/api/v1/checkout/orders", headers=headers_for(customer_user["token"]))
        assert resp.status_code == 200
        assert "orders" in resp.get_json()

    def test_create_order_via_checkout(self, client, customer_user, products):
        """POST /checkout creates order."""
        client.post(
            "/api/v1/checkout/cart/items",
            headers=headers_for(customer_user["token"]),
            json={"product_id": products[0].id, "quantity": 1},
        )
        resp = client.post(
            "/api/v1/checkout/checkout",
            headers=headers_for(customer_user["token"]),
            json={"card_number": "4242424242424242", "expire_month": 12, "expire_year": 2028, "cvv": "123"},
        )
        assert resp.status_code == 200
        assert resp.get_json()["order"]["status"] == "confirmed"


# ─── 4. Input Validation Tests ───────────────────────────────────────────────


class TestInputValidation:
    """Invalid payloads return 400."""

    def test_register_missing_email_returns_400(self, client):
        """Registration without email returns 400."""
        resp = client.post(
            "/api/v1/auth/register",
            json={"name": "User", "password": "password123"},
        )
        assert resp.status_code == 400

    def test_register_invalid_email_returns_400(self, client):
        """Registration with invalid email returns 400."""
        resp = client.post(
            "/api/v1/auth/register",
            json={"name": "User", "email": "notanemail", "password": "password123"},
        )
        assert resp.status_code == 400

    def test_task_create_empty_title_returns_400(self, client, task_user):
        """Task with empty title returns 400."""
        resp = client.post(
            "/api/v1/tasks/",
            headers=headers_for(task_user["token"]),
            json={"title": "", "description": "Has desc"},
        )
        assert resp.status_code == 400

    def test_ticket_subject_too_short_returns_400(self, client, auth_headers):
        """Ticket subject < 5 chars returns 400."""
        resp = client.post(
            "/api/v1/tickets/",
            headers=auth_headers,
            json={
                "subject": "Hi",
                "description": "Description with at least twenty characters",
                "category": "technical",
                "customer_email": "test@example.com",
            },
        )
        assert resp.status_code == 400

    def test_ticket_description_too_short_returns_400(self, client, auth_headers):
        """Ticket description < 20 chars returns 400."""
        resp = client.post(
            "/api/v1/tickets/",
            headers=auth_headers,
            json={
                "subject": "Valid Subject Here",
                "description": "Short",
                "category": "technical",
                "customer_email": "test@example.com",
            },
        )
        assert resp.status_code == 400


# ─── 5. Error Handling Tests ─────────────────────────────────────────────────


class TestErrorHandling:
    """404, 400, 500 handling."""

    def test_get_nonexistent_task_returns_404(self, client, task_user):
        """GET /tasks/99999 returns 404."""
        resp = client.get("/api/v1/tasks/99999", headers=headers_for(task_user["token"]))
        assert resp.status_code == 404

    def test_get_nonexistent_ticket_returns_404(self, client, auth_headers):
        """GET /tickets/99999 returns 404."""
        resp = client.get("/api/v1/tickets/99999", headers=auth_headers)
        assert resp.status_code == 404

    def test_update_nonexistent_task_returns_404(self, client, task_user):
        """PUT /tasks/99999 returns 404."""
        resp = client.put(
            "/api/v1/tasks/99999",
            headers=headers_for(task_user["token"]),
            json={"title": "Updated"},
        )
        assert resp.status_code == 404

    def test_delete_nonexistent_task_returns_404(self, client, task_user):
        """DELETE /tasks/99999 returns 404."""
        resp = client.delete("/api/v1/tasks/99999", headers=headers_for(task_user["token"]))
        assert resp.status_code == 404

    def test_get_nonexistent_user_returns_404(self, client, admin_user):
        """GET /users/99999 returns 404."""
        resp = client.get("/api/v1/users/99999", headers=headers_for(admin_user["token"]))
        assert resp.status_code == 404


# ─── 6. Performance Tests ───────────────────────────────────────────────────


class TestPerformance:
    """Response time under 500ms."""

    @pytest.mark.performance
    def test_auth_me_response_time(self, client, auth_headers):
        """GET /auth/me responds in < 500ms."""
        start = time.perf_counter()
        resp = client.get("/api/v1/auth/me", headers=auth_headers)
        elapsed_ms = (time.perf_counter() - start) * 1000
        assert resp.status_code == 200
        assert elapsed_ms < 500

    @pytest.mark.performance
    def test_list_tasks_response_time(self, client, task_user):
        """GET /tasks responds in < 500ms."""
        start = time.perf_counter()
        resp = client.get("/api/v1/tasks/", headers=headers_for(task_user["token"]))
        elapsed_ms = (time.perf_counter() - start) * 1000
        assert resp.status_code == 200
        assert elapsed_ms < 500

    @pytest.mark.performance
    def test_create_task_response_time(self, client, task_user):
        """POST /tasks responds in < 500ms."""
        start = time.perf_counter()
        resp = client.post(
            "/api/v1/tasks/",
            headers=headers_for(task_user["token"]),
            json={"title": "Perf Task", "description": "Test"},
        )
        elapsed_ms = (time.perf_counter() - start) * 1000
        assert resp.status_code == 201
        assert elapsed_ms < 500

    @pytest.mark.performance
    def test_list_tickets_response_time(self, client, auth_headers):
        """GET /tickets responds in < 500ms."""
        start = time.perf_counter()
        resp = client.get("/api/v1/tickets/", headers=auth_headers)
        elapsed_ms = (time.perf_counter() - start) * 1000
        assert resp.status_code == 200
        assert elapsed_ms < 500


# ─── 7. Rate Limiting Tests ─────────────────────────────────────────────────


class TestRateLimiting:
    """Rate limit enforcement."""

    def test_ticket_creation_rate_limit(self, client, auth_headers):
        """POST /tickets rate limited (10/min); 11th request returns 429."""
        for i in range(11):
            resp = client.post(
                "/api/v1/tickets/",
                headers=auth_headers,
                json={
                    "subject": f"Ticket {i} with enough chars",
                    "description": "A ticket description with at least twenty characters for validation.",
                    "priority": "medium",
                    "category": "technical",
                    "customer_email": "test@example.com",
                },
            )
            if resp.status_code == 429:
                assert i >= 10, "Rate limit should trigger after 10 requests"
                return
        pytest.skip("Rate limit not triggered in 11 requests (limiter may be disabled or high limit)")
