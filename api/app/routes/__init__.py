"""API route registration."""

from app.routes.auth import ns as auth_ns
from app.routes.users import ns as users_ns
from app.routes.tasks import ns as tasks_ns
from app.routes.projects import ns as projects_ns
from app.routes.notifications import ns as notifications_ns


def register_blueprints(api):
    """Register all API namespaces."""
    api.add_namespace(auth_ns, path="/auth")
    api.add_namespace(users_ns, path="/users")
    api.add_namespace(tasks_ns, path="/tasks")
    api.add_namespace(projects_ns, path="/projects")
    api.add_namespace(notifications_ns, path="/notifications")
