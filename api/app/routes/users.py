"""User endpoints (PRD 6.3) - Admin only for list/update."""

from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError as MarshmallowValidationError

from app import db
from app.models.user import User
from app.schemas.user import UserSchema, UserUpdateSchema
from app.utils.security import get_current_user
from app.exceptions import ForbiddenException, NotFoundException, ValidationException

ns = Namespace("users", description="User management (admin)")

user_schema = UserSchema()
user_update_schema = UserUpdateSchema()


@ns.route("/")
class UserList(Resource):
    """List users - Admin only."""

    @ns.doc("list_users")
    @ns.response(200, "Success")
    @jwt_required()
    def get(self):
        user = get_current_user()
        if user.role != "admin":
            raise ForbiddenException("Insufficient permissions")
        users = User.query.all()
        return {"status": "success", "users": user_schema.dump(users, many=True)}, 200


@ns.route("/<int:user_id>")
@ns.param("user_id", "User ID")
class UserDetail(Resource):
    """Get and update user - Admin only."""

    @ns.doc("get_user")
    @ns.response(200, "Success")
    @ns.response(404, "User not found")
    @jwt_required()
    def get(self, user_id):
        user = get_current_user()
        if user.role != "admin" and user.id != user_id:
            raise ForbiddenException("Insufficient permissions")
        target = User.query.get(user_id)
        if not target:
            raise NotFoundException("User not found")
        return {"status": "success", "user": user_schema.dump(target)}, 200

    @ns.doc("update_user")
    @ns.response(200, "User updated")
    @jwt_required()
    def put(self, user_id):
        user = get_current_user()
        if user.role != "admin":
            raise ForbiddenException("Insufficient permissions")
        target = User.query.get(user_id)
        if not target:
            raise NotFoundException("User not found")
        try:
            data = user_update_schema.load(request.get_json(), partial=True)
        except MarshmallowValidationError as err:
            raise ValidationException(errors=err.messages)
        for key, value in data.items():
            setattr(target, key, value)
        db.session.commit()
        return {"status": "success", "user": user_schema.dump(target)}, 200
