"""Discount code model for e-commerce."""

from datetime import datetime
from app import db


class DiscountCode(db.Model):
    """Discount/promo codes."""

    __tablename__ = "discount_codes"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    discount_type = db.Column(db.String(20), nullable=False)  # percent, fixed
    discount_value = db.Column(db.Numeric(10, 2), nullable=False)
    min_order_amount = db.Column(db.Numeric(10, 2), default=0)
    max_uses = db.Column(db.Integer, default=999999)
    uses_count = db.Column(db.Integer, default=0)
    expires_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
