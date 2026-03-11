"""User endpoints."""

from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required

from app.models.user import User

ns = Namespace("users", description="User operations")


@ns.route("/")
class UserList(Resource):
    """List users (example protected endpoint)."""

    @ns.doc("list_users")
    @ns.response(200, "Success")
    @ns.response(401, "Not authenticated")
    @jwt_required()
    def get(self):
        """List all users (protected)."""
        users = User.query.all()
        return [
            {
                "id": u.id,
                "email": u.email,
                "username": u.username,
            }
            for u in users
        ], 200


@ns.route("/<int:user_id>")
@ns.param("user_id", "User ID")
class UserDetail(Resource):
    """User detail by ID."""

    @ns.doc("get_user")
    @ns.response(200, "Success")
    @ns.response(404, "User not found")
    @ns.response(401, "Not authenticated")
    @jwt_required()
    def get(self, user_id):
        """Get user by ID."""
        user = User.query.get_or_404(user_id)
        return {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "is_active": user.is_active,
        }, 200
