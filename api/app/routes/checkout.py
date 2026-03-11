"""E-commerce checkout endpoints: cart, discount, payment."""

import re
from decimal import Decimal
from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app import db
from app.models.user import User
from app.models.product import Product
from app.models.cart import Cart, CartItem
from app.models.discount import DiscountCode
from app.models.order import Order, OrderItem
from app.schemas.checkout import AddCartItemSchema, UpdateCartItemSchema, ApplyDiscountSchema, CheckoutSchema
from app.exceptions import (
    ValidationException,
    NotFoundException,
    UnauthorizedException,
    ConflictException,
)

ns = Namespace("checkout", description="E-commerce cart and checkout")

add_item_schema = AddCartItemSchema()
update_item_schema = UpdateCartItemSchema()
discount_schema = ApplyDiscountSchema()
checkout_schema = CheckoutSchema()

# Mock payment: card number ending in 0002 = declined, 0127 = insufficient
def mock_payment_process(card_number):
    cleaned = re.sub(r"\D", "", str(card_number))
    if len(cleaned) < 13 or len(cleaned) > 19:
        return False, "Invalid card number"
    if cleaned.endswith("0002"):
        return False, "Payment declined"
    if cleaned.endswith("0127"):
        return False, "Insufficient funds"
    return True, "ok"


def get_or_create_cart(user_id):
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.commit()
    return cart


@ns.route("/cart")
class CartResource(Resource):
    """Get current user's cart."""

    @ns.doc("get_cart")
    @ns.response(200, "Success")
    @jwt_required()
    def get(self):
        user_id = int(get_jwt_identity())
        cart = get_or_create_cart(user_id)
        items = []
        subtotal = Decimal("0")
        for ci in cart.items:
            p = ci.product
            line_total = p.price * ci.quantity
            subtotal += line_total
            items.append({
                "id": ci.id,
                "product_id": p.id,
                "product_name": p.name,
                "quantity": ci.quantity,
                "unit_price": float(p.price),
                "line_total": float(line_total),
            })
        discount_amount = Decimal("0")
        if cart.discount_code:
            dc = cart.discount_code
            if dc.discount_type == "percent":
                discount_amount = subtotal * (dc.discount_value / 100)
            else:
                discount_amount = min(dc.discount_value, subtotal)
        total = max(Decimal("0"), subtotal - discount_amount)
        return {
            "status": "success",
            "cart": {
                "items": items,
                "subtotal": float(subtotal),
                "discount_amount": float(discount_amount),
                "total": float(total),
                "discount_code": cart.discount_code.code if cart.discount_code else None,
            },
        }, 200


@ns.route("/cart/items")
class CartItemsResource(Resource):
    """Add item to cart."""

    @ns.doc("add_cart_item")
    @ns.response(201, "Item added")
    @ns.response(400, "Validation error")
    @ns.response(404, "Product not found")
    @jwt_required()
    def post(self):
        try:
            data = add_item_schema.load(request.get_json())
        except ValidationError as err:
            raise ValidationException(errors=err.messages)
        user_id = int(get_jwt_identity())
        product = Product.query.get(data["product_id"])
        if not product:
            raise NotFoundException("Product not found")
        if data["quantity"] > product.stock:
            raise ValidationException(errors={"quantity": ["Exceeds available stock"]})
        cart = get_or_create_cart(user_id)
        existing = CartItem.query.filter_by(cart_id=cart.id, product_id=product.id).first()
        if existing:
            new_qty = existing.quantity + data["quantity"]
            if new_qty > product.stock:
                raise ValidationException(errors={"quantity": ["Exceeds available stock"]})
            existing.quantity = new_qty
        else:
            if len(cart.items) >= 50:
                raise ValidationException(errors={"cart": ["Cart limit (50 items) reached"]})
            ci = CartItem(cart_id=cart.id, product_id=product.id, quantity=data["quantity"])
            db.session.add(ci)
        db.session.commit()
        return {"status": "success", "message": "Item added to cart"}, 201


@ns.route("/cart/items/<int:item_id>")
class CartItemResource(Resource):
    """Update or remove cart item."""

    @ns.doc("update_cart_item")
    @ns.response(200, "Updated")
    @jwt_required()
    def put(self, item_id):
        try:
            data = update_item_schema.load(request.get_json())
        except ValidationError as err:
            raise ValidationException(errors=err.messages)
        user_id = int(get_jwt_identity())
        cart = get_or_create_cart(user_id)
        ci = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()
        if not ci:
            raise NotFoundException("Cart item not found")
        if data["quantity"] > ci.product.stock:
            raise ValidationException(errors={"quantity": ["Exceeds available stock"]})
        ci.quantity = data["quantity"]
        db.session.commit()
        return {"status": "success", "message": "Cart updated"}, 200

    @ns.doc("remove_cart_item")
    @ns.response(200, "Removed")
    @jwt_required()
    def delete(self, item_id):
        user_id = int(get_jwt_identity())
        cart = get_or_create_cart(user_id)
        ci = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()
        if not ci:
            raise NotFoundException("Cart item not found")
        db.session.delete(ci)
        db.session.commit()
        return {"status": "success", "message": "Item removed"}, 200


@ns.route("/cart/discount")
class CartDiscountResource(Resource):
    """Apply or remove discount code."""

    @ns.doc("apply_discount")
    @ns.response(200, "Discount applied")
    @ns.response(400, "Invalid or expired code")
    @jwt_required()
    def post(self):
        try:
            data = discount_schema.load(request.get_json())
        except ValidationError as err:
            raise ValidationException(errors=err.messages)
        code_str = data["code"].strip()[:50]
        dc = DiscountCode.query.filter_by(code=code_str).first()
        if not dc:
            raise ValidationException(errors={"code": ["Invalid discount code"]})
        from datetime import datetime
        if dc.expires_at and dc.expires_at < datetime.utcnow():
            raise ValidationException(errors={"code": ["Discount code expired"]})
        if dc.uses_count >= dc.max_uses:
            raise ValidationException(errors={"code": ["Discount code limit reached"]})
        user_id = int(get_jwt_identity())
        cart = get_or_create_cart(user_id)
        subtotal = sum(ci.product.price * ci.quantity for ci in cart.items)
        if subtotal < dc.min_order_amount:
            raise ValidationException(
                errors={"code": [f"Minimum order amount ${dc.min_order_amount} required"]}
            )
        cart.discount_code_id = dc.id
        db.session.commit()
        return {"status": "success", "message": "Discount applied"}, 200


@ns.route("/checkout")
class CheckoutResource(Resource):
    """Process checkout (mock payment). PCI: card not stored."""

    @ns.doc("checkout")
    @ns.response(200, "Order confirmed")
    @ns.response(400, "Validation or cart error")
    @ns.response(402, "Payment failed")
    @jwt_required()
    def post(self):
        try:
            data = checkout_schema.load(request.get_json())
        except ValidationError as err:
            raise ValidationException(errors=err.messages)
        card = re.sub(r"\D", "", str(data["card_number"]))
        if len(card) < 13 or len(card) > 19:
            raise ValidationException(errors={"card_number": ["Invalid card number"]})
        user_id = int(get_jwt_identity())
        cart = get_or_create_cart(user_id)
        if not cart.items:
            raise ValidationException(errors={"cart": ["Cart is empty"]})
        subtotal = sum(ci.product.price * ci.quantity for ci in cart.items)
        discount_amount = Decimal("0")
        discount_code_used = None
        if cart.discount_code:
            dc = cart.discount_code
            if dc.discount_type == "percent":
                discount_amount = subtotal * (dc.discount_value / 100)
            else:
                discount_amount = min(dc.discount_value, subtotal)
            discount_code_used = dc.code
            dc.uses_count += 1
        total = max(Decimal("0"), subtotal - discount_amount)
        ok, msg = mock_payment_process(card)
        if not ok:
            return {"status": "error", "message": msg, "code": "PAYMENT_FAILED"}, 402
        import uuid
        order_num = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        order = Order(
            order_number=order_num,
            user_id=user_id,
            subtotal=subtotal,
            discount_amount=discount_amount,
            total=total,
            discount_code_used=discount_code_used,
            payment_status="paid",
            email_sent=True,
        )
        db.session.add(order)
        db.session.flush()
        for ci in list(cart.items):
            oi = OrderItem(
                order_id=order.id,
                product_id=ci.product_id,
                product_name=ci.product.name,
                quantity=ci.quantity,
                unit_price=ci.product.price,
            )
            db.session.add(oi)
            ci.product.stock -= ci.quantity
        for ci in cart.items:
            db.session.delete(ci)
        cart.discount_code_id = None
        db.session.commit()
        return {
            "status": "success",
            "order": {
                "id": order.id,
                "order_number": order_num,
                "total": float(total),
                "status": "confirmed",
            },
        }, 200


@ns.route("/orders")
class OrdersResource(Resource):
    """List user's orders."""

    @ns.doc("list_orders")
    @ns.response(200, "Success")
    @jwt_required()
    def get(self):
        user_id = int(get_jwt_identity())
        orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
        return {
            "status": "success",
            "orders": [
                {
                    "id": o.id,
                    "order_number": o.order_number,
                    "total": float(o.total),
                    "status": o.status,
                    "created_at": o.created_at.isoformat() if o.created_at else None,
                }
                for o in orders
            ],
        }, 200
