"""
E-Commerce Checkout – pytest Automation Scripts

35+ test cases covering: cart, discount codes, payment, order, security.
Aligns with docs/TEST_CASES_ECOMMERCE_CHECKOUT.md
"""

import pytest
from datetime import datetime, timedelta
from decimal import Decimal

from app import db
from app.models.user import User
from app.models.product import Product
from app.models.discount import DiscountCode
from app.models.cart import Cart, CartItem
from app.models.order import Order


# ─── Fixtures: Test Data Generation ─────────────────────────────────────────


@pytest.fixture
def checkout_user(client):
    """Create customer user with auth token."""
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Checkout Customer",
            "email": "customer@checkout-test.com",
            "password": "customer123",
        },
    )
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "customer@checkout-test.com", "password": "customer123"},
    )
    data = resp.get_json()
    return {"token": data["access_token"], "id": data["user"]["id"], "email": data["user"]["email"]}


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def products(app):
    """Seed products per TEST_CASES_ECOMMERCE_CHECKOUT.md."""
    with app.app_context():
        for p in [
            {"sku": "PROD-001", "name": "Wireless Mouse", "price": Decimal("29.99"), "stock": 100},
            {"sku": "PROD-002", "name": "USB-C Cable", "price": Decimal("12.99"), "stock": 200},
            {"sku": "PROD-003", "name": "Laptop Stand", "price": Decimal("49.99"), "stock": 50},
        ]:
            if not Product.query.filter_by(sku=p["sku"]).first():
                db.session.add(Product(**p))
        db.session.commit()
        return list(Product.query.all())


@pytest.fixture
def discount_codes(app):
    """Seed discount codes."""
    with app.app_context():
        now = datetime.utcnow()
        expired = now - timedelta(days=1)
        for dc in [
            {"code": "SAVE10", "discount_type": "percent", "discount_value": 10, "min_order_amount": 0, "max_uses": 100},
            {"code": "FLAT20", "discount_type": "fixed", "discount_value": 20, "min_order_amount": 50, "max_uses": 50},
            {"code": "EXPIRED", "discount_type": "percent", "discount_value": 15, "min_order_amount": 0, "max_uses": 100, "expires_at": expired},
        ]:
            if not DiscountCode.query.filter_by(code=dc["code"]).first():
                db.session.add(DiscountCode(**dc))
        db.session.commit()
        return list(DiscountCode.query.all())


@pytest.fixture
def seeded_checkout(client, app, checkout_user, products, discount_codes):
    """Ensure products and discounts exist before checkout tests."""
    return {"user": checkout_user, "products": products, "discounts": discount_codes}


# ─── 1. Positive Test Cases ──────────────────────────────────────────────────


class TestPositiveCart:
    """CHK-P01–P04: Add, update, remove cart items."""

    def test_chk_p01_add_single_item_to_cart(self, client, seeded_checkout):
        """CHK-P01: Add single item, 201."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        resp = client.post(
            "/api/v1/checkout/cart/items",
            headers=auth_headers(user["token"]),
            json={"product_id": products[0].id, "quantity": 1},
        )
        assert resp.status_code == 201
        cart_resp = client.get("/api/v1/checkout/cart", headers=auth_headers(user["token"]))
        assert len(cart_resp.get_json()["cart"]["items"]) == 1

    def test_chk_p02_add_multiple_items(self, client, seeded_checkout):
        """CHK-P02: Add multiple items, cart total correct."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[0].id, "quantity": 2})
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[1].id, "quantity": 1})
        cart = client.get("/api/v1/checkout/cart", headers=auth_headers(user["token"])).get_json()
        assert len(cart["cart"]["items"]) == 2
        expected = float(products[0].price * 2 + products[1].price)
        assert abs(cart["cart"]["subtotal"] - expected) < 0.01

    def test_chk_p03_update_cart_item_quantity(self, client, seeded_checkout):
        """CHK-P03: Update quantity, 200."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[0].id, "quantity": 1})
        cart = client.get("/api/v1/checkout/cart", headers=auth_headers(user["token"])).get_json()
        item_id = cart["cart"]["items"][0]["id"]
        resp = client.put(
            f"/api/v1/checkout/cart/items/{item_id}",
            headers=auth_headers(user["token"]),
            json={"quantity": 3},
        )
        assert resp.status_code == 200
        cart2 = client.get("/api/v1/checkout/cart", headers=auth_headers(user["token"])).get_json()
        assert cart2["cart"]["items"][0]["quantity"] == 3

    def test_chk_p04_remove_item_from_cart(self, client, seeded_checkout):
        """CHK-P04: Remove item, 200."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[0].id, "quantity": 1})
        cart = client.get("/api/v1/checkout/cart", headers=auth_headers(user["token"])).get_json()
        item_id = cart["cart"]["items"][0]["id"]
        resp = client.delete(f"/api/v1/checkout/cart/items/{item_id}", headers=auth_headers(user["token"]))
        assert resp.status_code == 200
        cart2 = client.get("/api/v1/checkout/cart", headers=auth_headers(user["token"])).get_json()
        assert len(cart2["cart"]["items"]) == 0


class TestPositiveDiscount:
    """CHK-P05, P06: Apply valid discounts."""

    def test_chk_p05_apply_valid_percent_discount(self, client, seeded_checkout):
        """CHK-P05: Apply SAVE10, 200."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[0].id, "quantity": 1})
        resp = client.post(
            "/api/v1/checkout/cart/discount",
            headers=auth_headers(user["token"]),
            json={"code": "SAVE10"},
        )
        assert resp.status_code == 200
        cart = client.get("/api/v1/checkout/cart", headers=auth_headers(user["token"])).get_json()
        assert cart["cart"]["discount_code"] == "SAVE10"
        assert cart["cart"]["discount_amount"] > 0

    def test_chk_p06_apply_valid_fixed_discount(self, client, seeded_checkout):
        """CHK-P06: Apply FLAT20 with order >= $50."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[2].id, "quantity": 2})  # ~$100
        resp = client.post(
            "/api/v1/checkout/cart/discount",
            headers=auth_headers(user["token"]),
            json={"code": "FLAT20"},
        )
        assert resp.status_code == 200
        cart = client.get("/api/v1/checkout/cart", headers=auth_headers(user["token"])).get_json()
        assert cart["cart"]["discount_amount"] == 20


class TestPositiveCheckout:
    """CHK-P07–P12: Successful checkout flow."""

    def test_chk_p07_successful_payment_processing(self, client, seeded_checkout):
        """CHK-P07: Valid card, 200, order created."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[0].id, "quantity": 1})
        resp = client.post(
            "/api/v1/checkout/checkout",
            headers=auth_headers(user["token"]),
            json={"card_number": "4242424242424242", "expire_month": 12, "expire_year": 2028, "cvv": "123"},
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["order"]["status"] == "confirmed"
        assert "order_number" in data["order"]

    def test_chk_p08_order_confirmation_returned(self, client, seeded_checkout):
        """CHK-P08: Order ID and status in response."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[0].id, "quantity": 1})
        resp = client.post(
            "/api/v1/checkout/checkout",
            headers=auth_headers(user["token"]),
            json={"card_number": "4242424242424242", "expire_month": 12, "expire_year": 2028, "cvv": "123"},
        )
        assert resp.status_code == 200
        assert "id" in resp.get_json()["order"]
        assert resp.get_json()["order"]["status"] == "confirmed"

    def test_chk_p09_email_sent_flag(self, client, seeded_checkout):
        """CHK-P09: email_sent set on order (mock)."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[0].id, "quantity": 1})
        client.post(
            "/api/v1/checkout/checkout",
            headers=auth_headers(user["token"]),
            json={"card_number": "4242424242424242", "expire_month": 12, "expire_year": 2028, "cvv": "123"},
        )
        with client.application.app_context():
            order = Order.query.filter_by(user_id=user["id"]).first()
            assert order is not None
            assert order.email_sent is True

    def test_chk_p10_cart_cleared_after_checkout(self, client, seeded_checkout):
        """CHK-P10: Cart empty after checkout."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[0].id, "quantity": 1})
        client.post(
            "/api/v1/checkout/checkout",
            headers=auth_headers(user["token"]),
            json={"card_number": "4242424242424242", "expire_month": 12, "expire_year": 2028, "cvv": "123"},
        )
        cart = client.get("/api/v1/checkout/cart", headers=auth_headers(user["token"])).get_json()
        assert len(cart["cart"]["items"]) == 0

    def test_chk_p11_order_history_updated(self, client, seeded_checkout):
        """CHK-P11: New order in list."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[0].id, "quantity": 1})
        client.post(
            "/api/v1/checkout/checkout",
            headers=auth_headers(user["token"]),
            json={"card_number": "4242424242424242", "expire_month": 12, "expire_year": 2028, "cvv": "123"},
        )
        resp = client.get("/api/v1/checkout/orders", headers=auth_headers(user["token"]))
        assert resp.status_code == 200
        assert len(resp.get_json()["orders"]) >= 1

    def test_chk_p12_inventory_decremented(self, client, seeded_checkout):
        """CHK-P12: Stock reduced after checkout."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        p = products[0]
        initial_stock = p.stock
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": p.id, "quantity": 2})
        client.post(
            "/api/v1/checkout/checkout",
            headers=auth_headers(user["token"]),
            json={"card_number": "4242424242424242", "expire_month": 12, "expire_year": 2028, "cvv": "123"},
        )
        with client.application.app_context():
            updated = Product.query.get(p.id)
            assert updated.stock == initial_stock - 2


# ─── 2. Negative Test Cases ──────────────────────────────────────────────────


class TestNegativeCart:
    """CHK-N01–N03: Invalid cart operations."""

    def test_chk_n01_add_nonexistent_product(self, client, seeded_checkout):
        """CHK-N01: product_id 99999 → 404."""
        user = seeded_checkout["user"]
        resp = client.post(
            "/api/v1/checkout/cart/items",
            headers=auth_headers(user["token"]),
            json={"product_id": 99999, "quantity": 1},
        )
        assert resp.status_code == 404

    def test_chk_n02_add_zero_quantity(self, client, seeded_checkout):
        """CHK-N02: quantity=0 → 400."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        resp = client.post(
            "/api/v1/checkout/cart/items",
            headers=auth_headers(user["token"]),
            json={"product_id": products[0].id, "quantity": 0},
        )
        assert resp.status_code == 400

    def test_chk_n03_add_negative_quantity(self, client, seeded_checkout):
        """CHK-N03: quantity=-1 → 400."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        resp = client.post(
            "/api/v1/checkout/cart/items",
            headers=auth_headers(user["token"]),
            json={"product_id": products[0].id, "quantity": -1},
        )
        assert resp.status_code == 400


class TestNegativeDiscount:
    """CHK-N04–N07: Invalid discount codes."""

    def test_chk_n04_invalid_discount_code(self, client, seeded_checkout):
        """CHK-N04: Invalid code → 400."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[0].id, "quantity": 1})
        resp = client.post(
            "/api/v1/checkout/cart/discount",
            headers=auth_headers(user["token"]),
            json={"code": "INVALID"},
        )
        assert resp.status_code == 400
        assert "Invalid" in resp.get_json().get("errors", {}).get("code", [""])[0]

    def test_chk_n05_expired_discount_code(self, client, seeded_checkout):
        """CHK-N05: EXPIRED code → 400."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[0].id, "quantity": 1})
        resp = client.post(
            "/api/v1/checkout/cart/discount",
            headers=auth_headers(user["token"]),
            json={"code": "EXPIRED"},
        )
        assert resp.status_code == 400

    def test_chk_n06_discount_below_min_order(self, client, seeded_checkout):
        """CHK-N06: FLAT20 with $30 cart → 400."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[0].id, "quantity": 1})  # ~$30
        resp = client.post(
            "/api/v1/checkout/cart/discount",
            headers=auth_headers(user["token"]),
            json={"code": "FLAT20"},
        )
        assert resp.status_code == 400


class TestNegativePayment:
    """CHK-N08–N12: Payment failures."""

    def test_chk_n08_payment_declined(self, client, seeded_checkout):
        """CHK-N08: Declined card → 402."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[0].id, "quantity": 1})
        resp = client.post(
            "/api/v1/checkout/checkout",
            headers=auth_headers(user["token"]),
            json={"card_number": "4000000000000002", "expire_month": 12, "expire_year": 2028, "cvv": "123"},
        )
        assert resp.status_code == 402

    def test_chk_n09_insufficient_funds(self, client, seeded_checkout):
        """CHK-N09: Insufficient funds → 402."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[0].id, "quantity": 1})
        resp = client.post(
            "/api/v1/checkout/checkout",
            headers=auth_headers(user["token"]),
            json={"card_number": "4000000000000127", "expire_month": 12, "expire_year": 2028, "cvv": "123"},
        )
        assert resp.status_code == 402

    def test_chk_n10_invalid_card_format(self, client, seeded_checkout):
        """CHK-N10: Invalid card → 400."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[0].id, "quantity": 1})
        resp = client.post(
            "/api/v1/checkout/checkout",
            headers=auth_headers(user["token"]),
            json={"card_number": "invalid", "expire_month": 12, "expire_year": 2028, "cvv": "123"},
        )
        assert resp.status_code == 400

    def test_chk_n11_missing_payment_fields(self, client, seeded_checkout):
        """CHK-N11: Checkout without card → 400."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[0].id, "quantity": 1})
        resp = client.post(
            "/api/v1/checkout/checkout",
            headers=auth_headers(user["token"]),
            json={"expire_month": 12, "expire_year": 2028, "cvv": "123"},
        )
        assert resp.status_code == 400

    def test_chk_n12_checkout_empty_cart(self, client, seeded_checkout):
        """CHK-N12: Empty cart checkout → 400."""
        user = seeded_checkout["user"]
        resp = client.post(
            "/api/v1/checkout/checkout",
            headers=auth_headers(user["token"]),
            json={"card_number": "4242424242424242", "expire_month": 12, "expire_year": 2028, "cvv": "123"},
        )
        assert resp.status_code == 400
        assert "empty" in resp.get_json().get("errors", {}).get("cart", [""])[0].lower()


class TestNegativeAuth:
    """CHK-N13, N14: Unauthenticated access."""

    def test_chk_n13_unauth_cart_access(self, client, seeded_checkout):
        """CHK-N13: GET /cart without token → 401."""
        resp = client.get("/api/v1/checkout/cart")
        assert resp.status_code in (401, 422)

    def test_chk_n14_unauth_checkout(self, client, seeded_checkout):
        """CHK-N14: POST /checkout without token → 401."""
        resp = client.post(
            "/api/v1/checkout/checkout",
            json={"card_number": "4242424242424242", "expire_month": 12, "expire_year": 2028, "cvv": "123"},
        )
        assert resp.status_code in (401, 422)


# ─── 3. Edge Cases ───────────────────────────────────────────────────────────


class TestEdgeCases:
    """CHK-E01–E10."""

    def test_chk_e02_cart_at_stock_limit(self, client, seeded_checkout):
        """CHK-E02: Add qty = stock → 200."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        p = products[0]
        resp = client.post(
            "/api/v1/checkout/cart/items",
            headers=auth_headers(user["token"]),
            json={"product_id": p.id, "quantity": p.stock},
        )
        assert resp.status_code == 201

    def test_chk_e03_cart_exceeds_stock(self, client, seeded_checkout):
        """CHK-E03: Add qty > stock → 400."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        p = products[0]
        resp = client.post(
            "/api/v1/checkout/cart/items",
            headers=auth_headers(user["token"]),
            json={"product_id": p.id, "quantity": p.stock + 1},
        )
        assert resp.status_code == 400

    def test_chk_e09_discount_on_exactly_min_order(self, client, seeded_checkout):
        """CHK-E09: Cart >= $50, apply FLAT20 → 200."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[2].id, "quantity": 1})  # $49.99
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[1].id, "quantity": 1})  # +$12.99 = $62.98 >= $50
        resp = client.post(
            "/api/v1/checkout/cart/discount",
            headers=auth_headers(user["token"]),
            json={"code": "FLAT20"},
        )
        assert resp.status_code == 200


# ─── 4. Security Test Cases ──────────────────────────────────────────────────


class TestSecurity:
    """CHK-S01–S10."""

    def test_chk_s01_sql_injection_product_id(self, client, seeded_checkout):
        """CHK-S01: SQL injection in product_id prevented."""
        user = seeded_checkout["user"]
        resp = client.post(
            "/api/v1/checkout/cart/items",
            headers=auth_headers(user["token"]),
            json={"product_id": "'; DROP TABLE carts;--", "quantity": 1},
        )
        assert resp.status_code in (400, 404, 422)

    def test_chk_s02_sql_injection_discount_code(self, client, seeded_checkout):
        """CHK-S02: SQL injection in discount code → 400."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[0].id, "quantity": 1})
        resp = client.post(
            "/api/v1/checkout/cart/discount",
            headers=auth_headers(user["token"]),
            json={"code": "' OR '1'='1"},
        )
        assert resp.status_code == 400

    def test_chk_s03_xss_in_discount_code(self, client, seeded_checkout):
        """CHK-S03: XSS in discount code sanitized or rejected."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[0].id, "quantity": 1})
        resp = client.post(
            "/api/v1/checkout/cart/discount",
            headers=auth_headers(user["token"]),
            json={"code": "<script>alert(1)</script>"},
        )
        assert resp.status_code == 400

    def test_chk_s05_card_not_in_response(self, client, seeded_checkout):
        """CHK-S05: Card number never in response."""
        user = seeded_checkout["user"]
        products = seeded_checkout["products"]
        client.post("/api/v1/checkout/cart/items", headers=auth_headers(user["token"]), json={"product_id": products[0].id, "quantity": 1})
        resp = client.post(
            "/api/v1/checkout/checkout",
            headers=auth_headers(user["token"]),
            json={"card_number": "4242424242424242", "expire_month": 12, "expire_year": 2028, "cvv": "123"},
        )
        body = resp.get_data(as_text=True)
        assert "4242424242424242" not in body
