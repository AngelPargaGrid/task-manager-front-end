"""Pytest configuration and shared fixtures."""

import pytest

from app import create_app, db


@pytest.fixture
def app():
    """Create application for testing."""
    return create_app("testing")


@pytest.fixture
def client(app):
    """Create test client with database initialized."""
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client


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
