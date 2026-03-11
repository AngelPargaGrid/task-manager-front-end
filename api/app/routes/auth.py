"""Authentication endpoints (PRD 6.1)."""

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
from app.exceptions import ValidationException, ConflictException, UnauthorizedException

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
        """Register a new user (PRD FR-032)."""
        try:
            data = user_create_schema.load(request.get_json())
        except ValidationError as err:
            raise ValidationException(errors=err.messages)

        if User.query.filter_by(email=data["email"]).first():
            raise ConflictException("Email already registered")

        username = data.get("username") or data["email"]  # unique default
        if User.query.filter_by(username=username).first():
            raise ConflictException("Username already taken")

        user = User(
            name=data["name"],
            email=data["email"],
            username=username,
            role=data.get("role", "customer"),
            expertise_areas=data.get("expertise_areas") if data.get("role") == "agent" else None,
        )
        user.set_password(data["password"])
        db.session.add(user)
        db.session.commit()

        return {
            "status": "success",
            "message": "User created successfully",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
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
            raise ValidationException(errors=err.messages)

        user = User.query.filter_by(email=data["email"]).first()
        if not user or not user.check_password(data["password"]):
            raise UnauthorizedException("Invalid email or password")
        if not user.is_active:
            raise UnauthorizedException("Account is disabled")

        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return {
            "status": "success",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
            },
        }, 200


@ns.route("/logout")
class Logout(Resource):
    """Logout - client should discard token."""

    @ns.doc("logout")
    @ns.response(200, "Logged out")
    @jwt_required(optional=True)
    def post(self):
        """Logout. Client must discard the JWT token."""
        return {"status": "success", "message": "Logged out successfully"}, 200


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
            raise UnauthorizedException("User not found or inactive")
        access_token = create_access_token(identity=str(user_id))
        return {"status": "success", "access_token": access_token}, 200


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
            raise UnauthorizedException("User not found")

        return {
            "status": "success",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "availability_status": user.availability_status,
                "expertise_areas": user.expertise_areas,
                "is_active": user.is_active,
            },
        }, 200
