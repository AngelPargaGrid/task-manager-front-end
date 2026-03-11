"""Flask application factory."""

from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager, create_access_token
from flask_restx import Api
from flask_socketio import SocketIO

from config import config

db = SQLAlchemy()
migrate = Migrate()
ma = Marshmallow()
jwt = JWTManager()
socketio = SocketIO(cors_allowed_origins="*")


def create_app(config_name: str = "development") -> Flask:
    """Create and configure the Flask application."""
    flask_app = Flask(__name__)
    flask_app.config.from_object(config[config_name])

    db.init_app(flask_app)
    migrate.init_app(flask_app, db)
    ma.init_app(flask_app)
    jwt.init_app(flask_app)
    socketio.init_app(flask_app)

    # Mock JWT para pruebas: X-Mock-User-Id inyecta un token válido antes del JWT
    if flask_app.config.get("MOCK_JWT"):

        @flask_app.before_request
        def inject_mock_jwt():
            if request.headers.get("Authorization"):
                return  # Ya hay token, no hacer nada
            mock_user_id = request.headers.get("X-Mock-User-Id")
            if mock_user_id and mock_user_id.isdigit():
                with flask_app.app_context():
                    token = create_access_token(identity=mock_user_id)
                    request.environ["HTTP_AUTHORIZATION"] = f"Bearer {token}"

    api = Api(
        flask_app,
        version="1.0",
        title="Task Management API",
        description="Comprehensive API for task management with JWT auth, projects, team collaboration, and real-time notifications.",
        doc="/swagger",
        prefix="/api/v1",
        authorizations={
            "Bearer Auth": {
                "type": "apiKey",
                "in": "header",
                "name": "Authorization",
                "description": "JWT token: Bearer &lt;token&gt;",
            },
            "Mock Auth (solo desarrollo)": {
                "type": "apiKey",
                "in": "header",
                "name": "X-Mock-User-Id",
                "description": "Simula usuario autenticado. Solo cuando MOCK_JWT=true",
            },
        },
        security="Bearer Auth",
    )

    from app.routes import register_blueprints

    register_blueprints(api)

    from app.models import user, project, task, notification  # noqa: F401 - register models

    with flask_app.app_context():
        db.create_all()

    import app.socketio_events  # noqa: F401 - register WebSocket handlers

    return flask_app
