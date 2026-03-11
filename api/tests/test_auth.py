"""Authentication tests (PRD Testing section)."""

import pytest


def test_user_registration(client):
    """Register new user returns 201 with user data."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "New User",
            "email": "new@example.com",
            "password": "securepass",
        },
    )
    assert response.status_code == 201
    data = response.get_json()
    assert "user" in data
    assert data["user"]["email"] == "new@example.com"
    assert data["user"]["name"] == "New User"
    assert "id" in data["user"]


def test_login_success(client):
    """Login with valid credentials returns 200 with access_token."""
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "User",
            "email": "test@test.com",
            "password": "pass12345",
        },
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@test.com", "password": "pass12345"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert "access_token" in data
    assert "user" in data


def test_login_invalid_password(client):
    """Login with wrong password returns 401."""
    client.post(
        "/api/v1/auth/register",
        json={"name": "User", "email": "user@x.com", "password": "correct12"},
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "user@x.com", "password": "wrong"},
    )
    assert response.status_code == 401


def test_register_duplicate_email(client):
    """Register with existing email returns 409."""
    client.post(
        "/api/v1/auth/register",
        json={"name": "First", "email": "dup@x.com", "password": "password123"},
    )
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "Second", "email": "dup@x.com", "password": "password123"},
    )
    assert response.status_code == 409


def test_auth_me_requires_token(client):
    """GET /auth/me without token returns 401."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code in (401, 422)


def test_auth_me_with_token(client, auth_headers):
    """GET /auth/me with valid token returns user info."""
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.get_json()
    assert "user" in data
    assert data["user"]["email"] == "test@example.com"
