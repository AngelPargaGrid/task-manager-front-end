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


class TestingConfig(Config):
    """Testing configuration."""

    TESTING = True
    MOCK_JWT = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


class ProductionConfig(Config):
    """Production configuration."""

    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")


config = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
