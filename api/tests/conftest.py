"""Pytest configuration and shared fixtures."""

import pytest

from app import create_app, db


@pytest.fixture
def app():
    """Create application for testing."""
    app = create_app("testing")
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client with database initialized."""
    return app.test_client()


@pytest.fixture
def auth_headers(client):
    """Register and login, return Authorization headers for authenticated requests."""
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123",
        },
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "password123"},
    )
    token = response.get_json().get("access_token")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def task_user(client):
    """Create and return a user with auth token for task tests."""
    resp = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Task User",
            "email": "taskuser@example.com",
            "password": "password123",
        },
    )
    assert resp.status_code == 201
    user_id = resp.get_json().get("user", {}).get("id")
    token_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "taskuser@example.com", "password": "password123"},
    )
    token = token_resp.get_json().get("access_token")
    return {"id": user_id, "email": "taskuser@example.com", "token": token}


@pytest.fixture
def task_user2(client):
    """Create second user for assignment tests."""
    resp = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Task User 2",
            "email": "taskuser2@example.com",
            "password": "password123",
        },
    )
    assert resp.status_code == 201
    user_id = resp.get_json().get("user", {}).get("id")
    token_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "taskuser2@example.com", "password": "password123"},
    )
    token = token_resp.get_json().get("access_token")
    return {"id": user_id, "email": "taskuser2@example.com", "token": token}
