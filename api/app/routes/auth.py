"""Authentication endpoints."""

from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from marshmallow import ValidationError

from app import db
from app.models.user import User
from app.schemas.user import UserCreateSchema, UserLoginSchema

ns = Namespace("auth", description="Authentication operations")

user_create_schema = UserCreateSchema()
user_login_schema = UserLoginSchema()


@ns.route("/register")
class Register(Resource):
    """User registration."""

    @ns.doc("register_user", security=[])
    @ns.response(201, "User created")
    @ns.response(400, "Validation error")
    @ns.response(409, "User already exists")
    def post(self):
        """Register a new user."""
        try:
            data = user_create_schema.load(request.get_json())
        except ValidationError as err:
            return {"errors": err.messages}, 400

        if User.query.filter_by(email=data["email"]).first():
            return {"message": "Email already registered"}, 409
        if User.query.filter_by(username=data["username"]).first():
            return {"message": "Username already taken"}, 409

        user = User(
            email=data["email"],
            username=data["username"],
        )
        user.set_password(data["password"])
        db.session.add(user)
        db.session.commit()

        return {
            "message": "User created successfully",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
            },
        }, 201


@ns.route("/login")
class Login(Resource):
    """User login."""

    @ns.doc("login", security=[])
    @ns.response(200, "Login successful")
    @ns.response(401, "Invalid credentials")
    def post(self):
        """Authenticate user and return JWT tokens."""
        try:
            data = user_login_schema.load(request.get_json())
        except ValidationError as err:
            return {"errors": err.messages}, 400

        user = User.query.filter_by(email=data["email"]).first()
        if not user or not user.check_password(data["password"]):
            return {"message": "Invalid email or password"}, 401
        if not user.is_active:
            return {"message": "Account is disabled"}, 401

        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
            },
        }, 200


@ns.route("/refresh")
class Refresh(Resource):
    """Token refresh."""

    @ns.doc("refresh_token")
    @ns.response(200, "Token refreshed")
    @ns.response(401, "Invalid or expired token")
    @jwt_required(refresh=True)
    def post(self):
        """Get a new access token using refresh token."""
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user or not user.is_active:
            return {"message": "User not found or inactive"}, 401

        access_token = create_access_token(identity=str(user_id))
        return {"access_token": access_token}, 200


@ns.route("/me")
class Me(Resource):
    """Current user info."""

    @ns.doc("get_current_user")
    @ns.response(200, "User info")
    @ns.response(401, "Not authenticated")
    @jwt_required()
    def get(self):
        """Get current authenticated user."""
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404

        return {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "is_active": user.is_active,
        }, 200
