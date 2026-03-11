"""Application configuration."""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

basedir = Path(__file__).resolve().parent


class Config:
    """Base configuration."""

    SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-secret-key-change-in-production"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or "dev-secret-key-change-in-production"
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours (PRD NFR-006)
    JWT_REFRESH_TOKEN_EXPIRES = 86400 * 7  # 7 days

    # Rate limiting (PRD NFR-007: 100 req/min per user)
    RATELIMIT_DEFAULT = "100 per minute"

    # Redis (for cache and Celery broker)
    REDIS_URL = os.environ.get("REDIS_URL") or "redis://localhost:6379/0"

    # Celery
    CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL") or "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND = os.environ.get("CELERY_RESULT_BACKEND") or "redis://localhost:6379/0"


class DevelopmentConfig(Config):
    """Development configuration."""

    DEBUG = True
    # Mock JWT para pruebas: usa header X-Mock-User-Id en lugar de Bearer token
    MOCK_JWT = os.environ.get("MOCK_JWT", "true").lower() == "true"
    _instance_path = basedir / "instance"
    _instance_path.mkdir(exist_ok=True)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL"
    ) or f"sqlite:///{_instance_path / 'app.db'}"

    # Redis caching
    CACHE_TYPE = "redis"
    CACHE_REDIS_URL = os.environ.get("CACHE_REDIS_URL") or "redis://localhost:6379/1"
    CACHE_DEFAULT_TIMEOUT = 300


class TestingConfig(Config):
    """Testing configuration."""

    TESTING = True
    MOCK_JWT = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"

    # Use simple memory cache for tests (no Redis required)
    CACHE_TYPE = "simple"
    CACHE_DEFAULT_TIMEOUT = 60

    # Celery runs synchronously in tests (no broker required)
    CELERY_TASK_ALWAYS_EAGER = True


class ProductionConfig(Config):
    """Production configuration."""

    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")

    # Redis caching
    CACHE_TYPE = "redis"
    CACHE_REDIS_URL = os.environ.get("CACHE_REDIS_URL") or os.environ.get("REDIS_URL") or "redis://localhost:6379/1"
    CACHE_DEFAULT_TIMEOUT = 300


config = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
