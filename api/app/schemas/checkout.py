"""Checkout schemas for cart and order validation."""

from marshmallow import fields, validate
from flask_marshmallow import Schema


class AddCartItemSchema(Schema):
    """Add item to cart."""

    product_id = fields.Int(required=True, validate=validate.Range(min=1))
    quantity = fields.Int(required=True, validate=validate.Range(min=1, max=999))


class UpdateCartItemSchema(Schema):
    """Update cart item quantity."""

    quantity = fields.Int(required=True, validate=validate.Range(min=1, max=999))


class ApplyDiscountSchema(Schema):
    """Apply discount code."""

    code = fields.Str(required=True, validate=validate.Length(min=1, max=50))


def sanitize_card_number(val):
    """Accept only digits; reject SQL/XSS."""
    if not val or not isinstance(val, str):
        return None
    cleaned = "".join(c for c in val if c.isdigit())
    return cleaned if len(cleaned) >= 13 and len(cleaned) <= 19 else None


class CheckoutSchema(Schema):
    """Checkout payment (PCI: no card storage)."""

    card_number = fields.Str(required=True)  # Validated in route, not stored
    expire_month = fields.Int(required=True, validate=validate.Range(1, 12))
    expire_year = fields.Int(required=True, validate=validate.Range(2024, 2035))
    cvv = fields.Str(required=True, validate=validate.Length(3, 4))
