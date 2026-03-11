"""Flask application factory."""

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager, create_access_token
from flask_restx import Api
from flask_socketio import SocketIO
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache
from marshmallow import ValidationError as MarshmallowValidationError

from config import config
from app.exceptions import APIException

db = SQLAlchemy()
migrate = Migrate()
ma = Marshmallow()
jwt = JWTManager()
socketio = SocketIO(cors_allowed_origins="*")
limiter = Limiter(key_func=get_remote_address, default_limits=["100 per minute"])
cache = Cache()


def create_app(config_name: str = "development") -> Flask:
    """Create and configure the Flask application."""
    flask_app = Flask(__name__)
    flask_app.config.from_object(config[config_name])

    db.init_app(flask_app)
    migrate.init_app(flask_app, db)
    ma.init_app(flask_app)
    jwt.init_app(flask_app)
    socketio.init_app(flask_app)
    limiter.init_app(flask_app)
    cache_config = {
        "CACHE_TYPE": flask_app.config.get("CACHE_TYPE", "simple"),
        "CACHE_DEFAULT_TIMEOUT": flask_app.config.get("CACHE_DEFAULT_TIMEOUT", 300),
    }
    if flask_app.config.get("CACHE_TYPE") == "redis":
        cache_config["CACHE_REDIS_URL"] = flask_app.config.get("CACHE_REDIS_URL", "redis://localhost:6379/1")
    cache.init_app(flask_app, config=cache_config)

    # Error handlers (PRD 8.1)
    @flask_app.errorhandler(APIException)
    def handle_api_exception(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    @flask_app.errorhandler(MarshmallowValidationError)
    def handle_marshmallow_validation(err):
        from app.exceptions import ValidationException
        exc = ValidationException(errors=err.messages)
        response = jsonify(exc.to_dict())
        response.status_code = exc.status_code
        return response

    @flask_app.errorhandler(429)
    def handle_rate_limit(e):
        from app.exceptions import RateLimitException
        exc = RateLimitException(message="Too many requests")
        return jsonify(exc.to_dict()), 429

    # Mock JWT for development
    if flask_app.config.get("MOCK_JWT"):

        @flask_app.before_request
        def inject_mock_jwt():
            if request.headers.get("Authorization"):
                return
            mock_user_id = request.headers.get("X-Mock-User-Id")
            if mock_user_id and mock_user_id.isdigit():
                with flask_app.app_context():
                    token = create_access_token(identity=mock_user_id)
                    request.environ["HTTP_AUTHORIZATION"] = f"Bearer {token}"

    api = Api(
        flask_app,
        version="1.0",
        title="Customer Support & Blog API",
        description="Customer support ticket system (tickets, tasks, agents, admin) and Blog (posts, comments, categories, search) with JWT auth, Redis caching, and Swagger.",
        doc="/swagger",
        prefix="/api/v1",
        authorizations={
            "Bearer Auth": {
                "type": "apiKey",
                "in": "header",
                "name": "Authorization",
                "description": "JWT token: Bearer &lt;token&gt;",
            },
            "Mock Auth (dev only)": {
                "type": "apiKey",
                "in": "header",
                "name": "X-Mock-User-Id",
                "description": "Simulate authenticated user. Only when MOCK_JWT=true",
            },
        },
        security="Bearer Auth",
    )

    from app.routes import register_blueprints

    register_blueprints(api)

    from app.models import (  # noqa: F401
        user,
        ticket,
        comment,
        assignment,
        attachment,
        notification,
        task,
        project,
        blog_post,
        blog_comment,
        blog_category,
    )

    with flask_app.app_context():
        db.create_all()

    import app.socketio_events  # noqa: F401

    return flask_app
