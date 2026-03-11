"""Security utilities: input sanitization and role-based access (PRD NFR-009, FR-033)."""

import html
from functools import wraps

from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request

from app.models.user import User
from app.exceptions import ForbiddenException


def sanitize_input(data):
    """Sanitize user input to prevent XSS (PRD NFR-009, NFR-016)."""
    if isinstance(data, str):
        return html.escape(data)
    if isinstance(data, dict):
        return {k: sanitize_input(v) for k, v in data.items()}
    if isinstance(data, list):
        return [sanitize_input(item) for item in data]
    return data


def get_current_user():
    """Get the current authenticated user from JWT."""
    verify_jwt_in_request()
    user_id = int(get_jwt_identity())
    return User.query.get(user_id)


def role_required(*roles):
    """Decorator to enforce role-based access control."""

    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            user = get_current_user()
            if not user:
                raise ForbiddenException("User not found")
            if user.role not in roles:
                raise ForbiddenException("Insufficient permissions")
            return f(*args, **kwargs)

        return decorated_function

    return decorator
