"""Flask application factory."""

from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager, create_access_token
from flask_restx import Api

from config import config

db = SQLAlchemy()
migrate = Migrate()
ma = Marshmallow()
jwt = JWTManager()


def create_app(config_name: str = "development") -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)
    jwt.init_app(app)

    # Mock JWT para pruebas: X-Mock-User-Id inyecta un token válido antes del JWT
    if app.config.get("MOCK_JWT"):

        @app.before_request
        def inject_mock_jwt():
            if request.headers.get("Authorization"):
                return  # Ya hay token, no hacer nada
            mock_user_id = request.headers.get("X-Mock-User-Id")
            if mock_user_id and mock_user_id.isdigit():
                with app.app_context():
                    token = create_access_token(identity=mock_user_id)
                    request.environ["HTTP_AUTHORIZATION"] = f"Bearer {token}"

    api = Api(
        app,
        version="1.0",
        title="REST API",
        description="Flask REST API with SQLAlchemy, Marshmallow, and JWT",
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

    from app.models import user  # noqa: F401 - register models

    with app.app_context():
        db.create_all()

    return app
