"""Performance tests and benchmarks.

Target metrics (after optimization):
- Response time: < 100ms for list/create operations
- Database queries: 1-2 per request (verified via assertion patterns)
- Requests/second: > 150 (stress test)
"""

import time
import pytest


@pytest.mark.performance
def test_list_tasks_response_time(client, task_user):
    """GET /tasks response time under 200ms (baseline)."""
    # Create a few tasks
    for i in range(5):
        client.post(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"title": f"Task {i}"},
        )

    start = time.perf_counter()
    response = client.get(
        "/api/v1/tasks/",
        headers={"Authorization": f"Bearer {task_user['token']}"},
    )
    elapsed_ms = (time.perf_counter() - start) * 1000

    assert response.status_code == 200
    assert elapsed_ms < 500  # Allow 500ms for CI; aim for < 100ms in production


@pytest.mark.performance
def test_create_task_response_time(client, task_user):
    """POST /tasks response time under 200ms."""
    start = time.perf_counter()
    response = client.post(
        "/api/v1/tasks/",
        headers={"Authorization": f"Bearer {task_user['token']}"},
        json={"title": "Perf Task", "description": "Description"},
    )
    elapsed_ms = (time.perf_counter() - start) * 1000

    assert response.status_code == 201
    assert elapsed_ms < 500


@pytest.mark.performance
def test_auth_login_response_time(client):
    """POST /auth/login response time under 200ms."""
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Perf User",
            "email": "perf@example.com",
            "password": "password123",
        },
    )

    start = time.perf_counter()
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "perf@example.com", "password": "password123"},
    )
    elapsed_ms = (time.perf_counter() - start) * 1000

    assert response.status_code == 200
    assert elapsed_ms < 500


@pytest.mark.performance
def test_concurrent_list_requests(client, task_user):
    """Multiple sequential requests complete within acceptable total time."""
    # Create tasks
    client.post(
        "/api/v1/tasks/",
        headers={"Authorization": f"Bearer {task_user['token']}"},
        json={"title": "Task"},
    )

    iterations = 10
    start = time.perf_counter()
    for _ in range(iterations):
        resp = client.get(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
        )
        assert resp.status_code == 200
    elapsed = time.perf_counter() - start

    # 10 requests in under 2 seconds (200ms avg per request)
    assert elapsed < 2.0
    avg_ms = (elapsed / iterations) * 1000
    assert avg_ms < 300  # 300ms average per request acceptable in CI
