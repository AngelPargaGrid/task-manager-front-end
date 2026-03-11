"""Validation and security tests (PRD Testing section)."""

import pytest
from flask import url_for

from app import create_app, db
from app.models.user import User


@pytest.fixture
def app():
    """Create application for testing."""
    app = create_app("testing")
    return app


@pytest.fixture
def client(app):
    """Create test client."""
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client


@pytest.fixture
def customer(client):
    """Create and return a customer user with auth token."""
    resp = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test Customer",
            "email": "customer@example.com",
            "password": "password123",
        },
    )
    assert resp.status_code == 201
    token = client.post(
        "/api/v1/auth/login",
        json={"email": "customer@example.com", "password": "password123"},
    ).get_json().get("access_token")
    return {"email": "customer@example.com", "token": token}


@pytest.fixture
def agent(client):
    """Create and return an agent user with auth token."""
    resp = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test Agent",
            "email": "agent@example.com",
            "password": "password123",
            "role": "agent",
        },
    )
    assert resp.status_code == 201
    agent_id = resp.get_json().get("user", {}).get("id")
    token = client.post(
        "/api/v1/auth/login",
        json={"email": "agent@example.com", "password": "password123"},
    ).get_json().get("access_token")
    return {"email": "agent@example.com", "token": token, "id": agent_id}


@pytest.fixture
def admin_user(client):
    """Create and return an admin user with auth token."""
    resp = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test Admin",
            "email": "admin@example.com",
            "password": "password123",
            "role": "admin",
        },
    )
    assert resp.status_code == 201
    token = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "password123"},
    ).get_json().get("access_token")
    return {"email": "admin@example.com", "token": token}


def test_invalid_email_returns_400(client, customer):
    """1. Invalid email: 400 Bad Request - 'Invalid email format'"""
    resp = client.post(
        "/api/v1/tickets/",
        headers={"Authorization": f"Bearer {customer['token']}"},
        json={
            "subject": "Valid subject here",
            "description": "This is a valid description with enough text",
            "priority": "medium",
            "category": "technical",
            "customer_email": "not-an-email",
        },
    )
    assert resp.status_code == 400
    data = resp.get_json()
    assert data.get("code") == "VALIDATION_ERROR"
    assert "email" in str(data.get("errors", {})).lower() or "invalid" in str(data.get("message", "")).lower()


def test_invalid_priority_returns_400(client, customer):
    """2. Invalid priority: 400 Bad Request - 'Invalid priority level'"""
    resp = client.post(
        "/api/v1/tickets/",
        headers={"Authorization": f"Bearer {customer['token']}"},
        json={
            "subject": "Valid subject here",
            "description": "This is a valid description with enough text",
            "priority": "invalid_priority",
            "category": "technical",
            "customer_email": "customer@example.com",
        },
    )
    assert resp.status_code == 400
    data = resp.get_json()
    assert data.get("code") == "VALIDATION_ERROR"
    assert "priority" in str(data.get("errors", {})).lower() or "priority" in str(data.get("message", "")).lower()


def test_unauthorized_access_returns_403(client, customer, agent):
    """3. Unauthorized access: 403 Forbidden - 'Insufficient permissions'
    Customer tries to access admin-only endpoint (assign ticket).
    """
    # First create a ticket as customer
    create_resp = client.post(
        "/api/v1/tickets/",
        headers={"Authorization": f"Bearer {customer['token']}"},
        json={
            "subject": "Test ticket subject",
            "description": "This is a valid description with enough characters",
            "priority": "medium",
            "category": "technical",
            "customer_email": "customer@example.com",
        },
    )
    assert create_resp.status_code == 201
    ticket_id = create_resp.get_json().get("ticket", {}).get("id")

    # Customer (not admin) tries to assign - should get 403
    resp = client.post(
        f"/api/v1/tickets/{ticket_id}/assign",
        headers={"Authorization": f"Bearer {customer['token']}"},
        json={"agent_id": 2},
    )
    assert resp.status_code == 403
    data = resp.get_json()
    assert data.get("code") == "FORBIDDEN"
    assert "permission" in data.get("message", "").lower() or "insufficient" in data.get("message", "").lower()


def test_valid_request_returns_201(client, customer):
    """4. Valid request: 201 Created with ticket data"""
    resp = client.post(
        "/api/v1/tickets/",
        headers={"Authorization": f"Bearer {customer['token']}"},
        json={
            "subject": "Valid subject here",
            "description": "This is a valid description with enough text for validation",
            "priority": "high",
            "category": "technical",
            "customer_email": "customer@example.com",
        },
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert data.get("status") == "success"
    ticket = data.get("ticket", {})
    assert ticket.get("subject") == "Valid subject here"
    assert ticket.get("priority") == "high"
    assert ticket.get("status") == "open"
    assert ticket.get("ticket_number", "").startswith("TICK-")


def test_create_ticket_without_auth_returns_401(client):
    """Create ticket without auth returns 401."""
    resp = client.post(
        "/api/v1/tickets/",
        json={
            "subject": "Valid subject",
            "description": "Valid description with enough characters",
            "category": "technical",
            "customer_email": "user@example.com",
        },
    )
    # May be 401 or 422 depending on JWT config
    assert resp.status_code in (401, 422)


def test_description_too_short_returns_400(client, customer):
    """Description less than 20 chars returns 400."""
    resp = client.post(
        "/api/v1/tickets/",
        headers={"Authorization": f"Bearer {customer['token']}"},
        json={
            "subject": "Valid subject here",
            "description": "Too short",
            "priority": "medium",
            "category": "technical",
            "customer_email": "customer@example.com",
        },
    )
    assert resp.status_code == 400


def test_subject_too_short_returns_400(client, customer):
    """Subject less than 5 chars returns 400."""
    resp = client.post(
        "/api/v1/tickets/",
        headers={"Authorization": f"Bearer {customer['token']}"},
        json={
            "subject": "Hi",
            "description": "This is a valid description with enough text",
            "priority": "medium",
            "category": "technical",
            "customer_email": "customer@example.com",
        },
    )
    assert resp.status_code == 400


def test_status_transition_validation(client, customer, agent):
    """Invalid status transition returns 400."""
    create_resp = client.post(
        "/api/v1/tickets/",
        headers={"Authorization": f"Bearer {customer['token']}"},
        json={
            "subject": "Test ticket",
            "description": "This is a valid description with enough text",
            "category": "technical",
            "customer_email": "customer@example.com",
        },
    )
    ticket_id = create_resp.get_json().get("ticket", {}).get("id")

    # Admin assigns ticket to agent
    admin_resp = client.post(
        "/api/v1/auth/register",
        json={"name": "Admin", "email": "admin2@x.com", "password": "password123", "role": "admin"},
    )
    assert admin_resp.status_code == 201
    admin_token = client.post("/api/v1/auth/login", json={"email": "admin2@x.com", "password": "password123"}).get_json().get("access_token")
    assign_resp = client.post(
        f"/api/v1/tickets/{ticket_id}/assign",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"agent_id": agent["id"]},
    )
    assert assign_resp.status_code == 200, "Assign should succeed"

    # Agent tries invalid transition: assigned -> resolved (not allowed; must go in_progress first)
    resp = client.put(
        f"/api/v1/tickets/{ticket_id}/status",
        headers={"Authorization": f"Bearer {agent['token']}"},
        json={"status": "resolved"},
    )
    assert resp.status_code == 400
    data = resp.get_json()
    assert "transition" in str(data.get("message", "")).lower() or "allowed" in str(data.get("message", "")).lower()
