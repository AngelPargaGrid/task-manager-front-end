"""API route registration."""

from app.routes.auth import ns as auth_ns
from app.routes.users import ns as users_ns


def register_blueprints(api):
    """Register all API namespaces."""
    api.add_namespace(auth_ns, path="/auth")
    api.add_namespace(users_ns, path="/users")
