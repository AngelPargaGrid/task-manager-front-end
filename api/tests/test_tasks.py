"""Comprehensive tests for task management API with performance enhancements."""

import pytest
from unittest.mock import patch, MagicMock

from app import db
from app.models.task import Task
from app.models.project import Project, ProjectMember


class TestTaskList:
    """Tests for GET /tasks and POST /tasks."""

    def test_list_tasks_empty(self, client, task_user):
        """List tasks returns empty list for new user."""
        resp = client.get(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
        )
        assert resp.status_code == 200
        assert resp.get_json() == []

    def test_list_tasks_requires_auth(self, client):
        """List tasks without auth returns 401."""
        resp = client.get("/api/v1/tasks/")
        assert resp.status_code in (401, 422)

    def test_create_task(self, client, task_user):
        """Create task returns 201 with task data."""
        resp = client.post(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={
                "title": "Test Task",
                "description": "Test description",
                "status": "pending",
                "priority": "medium",
            },
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["title"] == "Test Task"
        assert data["description"] == "Test description"
        assert data["status"] == "pending"
        assert data["priority"] == "medium"
        assert data["owner_id"] == int(task_user["id"])
        assert "id" in data
        assert "created_at" in data

    def test_create_task_minimal(self, client, task_user):
        """Create task with only required title."""
        resp = client.post(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"title": "Minimal Task"},
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["title"] == "Minimal Task"
        assert data["status"] == "pending"
        assert data["priority"] == "medium"

    def test_create_task_invalid_status(self, client, task_user):
        """Create task with invalid status returns 400."""
        resp = client.post(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"title": "Task", "status": "invalid_status"},
        )
        assert resp.status_code == 400

    def test_create_task_invalid_priority(self, client, task_user):
        """Create task with invalid priority returns 400."""
        resp = client.post(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"title": "Task", "priority": "invalid"},
        )
        assert resp.status_code == 400

    def test_list_tasks_after_create(self, client, task_user):
        """List returns created tasks."""
        client.post(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"title": "Task 1"},
        )
        client.post(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"title": "Task 2"},
        )
        resp = client.get(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data) == 2
        titles = [t["title"] for t in data]
        assert "Task 1" in titles and "Task 2" in titles

    def test_list_tasks_filter_by_status(self, client, task_user):
        """List tasks filtered by status."""
        client.post(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"title": "Pending", "status": "pending"},
        )
        client.post(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"title": "In Progress", "status": "in_progress"},
        )
        resp = client.get(
            "/api/v1/tasks/?status=in_progress",
            headers={"Authorization": f"Bearer {task_user['token']}"},
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data) == 1
        assert data[0]["status"] == "in_progress"

    def test_list_tasks_filter_by_priority(self, client, task_user):
        """List tasks filtered by priority."""
        client.post(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"title": "High", "priority": "high"},
        )
        client.post(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"title": "Low", "priority": "low"},
        )
        resp = client.get(
            "/api/v1/tasks/?priority=high",
            headers={"Authorization": f"Bearer {task_user['token']}"},
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data) == 1
        assert data[0]["priority"] == "high"


class TestTaskDetail:
    """Tests for GET/PUT/DELETE /tasks/<id>."""

    def test_get_task(self, client, task_user):
        """Get task by ID."""
        create_resp = client.post(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"title": "Get Me"},
        )
        task_id = create_resp.get_json()["id"]
        resp = client.get(
            f"/api/v1/tasks/{task_id}",
            headers={"Authorization": f"Bearer {task_user['token']}"},
        )
        assert resp.status_code == 200
        assert resp.get_json()["title"] == "Get Me"

    def test_get_task_404(self, client, task_user):
        """Get non-existent task returns 404."""
        resp = client.get(
            "/api/v1/tasks/99999",
            headers={"Authorization": f"Bearer {task_user['token']}"},
        )
        assert resp.status_code == 404

    def test_get_task_forbidden(self, client, task_user, task_user2):
        """Get task owned by another user returns 403."""
        create_resp = client.post(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"title": "Private"},
        )
        task_id = create_resp.get_json()["id"]
        resp = client.get(
            f"/api/v1/tasks/{task_id}",
            headers={"Authorization": f"Bearer {task_user2['token']}"},
        )
        assert resp.status_code == 403

    def test_update_task(self, client, task_user):
        """Update task returns 200 with updated data."""
        create_resp = client.post(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"title": "Original"},
        )
        task_id = create_resp.get_json()["id"]
        resp = client.put(
            f"/api/v1/tasks/{task_id}",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"title": "Updated", "status": "in_progress"},
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["title"] == "Updated"
        assert data["status"] == "in_progress"

    def test_update_task_forbidden(self, client, task_user, task_user2):
        """Update task owned by another returns 403."""
        create_resp = client.post(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"title": "Mine"},
        )
        task_id = create_resp.get_json()["id"]
        resp = client.put(
            f"/api/v1/tasks/{task_id}",
            headers={"Authorization": f"Bearer {task_user2['token']}"},
            json={"title": "Hacked"},
        )
        assert resp.status_code == 403

    def test_delete_task(self, client, task_user):
        """Delete task returns 204."""
        create_resp = client.post(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"title": "To Delete"},
        )
        task_id = create_resp.get_json()["id"]
        resp = client.delete(
            f"/api/v1/tasks/{task_id}",
            headers={"Authorization": f"Bearer {task_user['token']}"},
        )
        assert resp.status_code == 204
        get_resp = client.get(
            f"/api/v1/tasks/{task_id}",
            headers={"Authorization": f"Bearer {task_user['token']}"},
        )
        assert get_resp.status_code == 404


class TestTaskWithProject:
    """Tests for tasks within projects."""

    def test_create_task_in_project(self, client, task_user):
        """Create task in project user owns."""
        with client.application.app_context():
            from app.models.project import Project, ProjectMember
            project = Project(name="Proj", description="Desc", owner_id=int(task_user["id"]))
            db.session.add(project)
            db.session.flush()
            pm = ProjectMember(project_id=project.id, user_id=int(task_user["id"]), role="owner")
            db.session.add(pm)
            db.session.commit()
            project_id = project.id

        resp = client.post(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"title": "Project Task", "project_id": project_id},
        )
        assert resp.status_code == 201
        assert resp.get_json()["project_id"] == project_id

    def test_create_task_in_nonexistent_project(self, client, task_user):
        """Create task in non-existent project returns 404."""
        resp = client.post(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"title": "Task", "project_id": 99999},
        )
        assert resp.status_code == 404

    def test_list_tasks_filter_by_project(self, client, task_user):
        """List tasks filtered by project_id."""
        with client.application.app_context():
            from app.models.project import Project, ProjectMember
            project = Project(name="Proj", description="D", owner_id=int(task_user["id"]))
            db.session.add(project)
            db.session.flush()
            db.session.add(ProjectMember(project_id=project.id, user_id=int(task_user["id"]), role="owner"))
            db.session.commit()
            project_id = project.id

        client.post(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"title": "In Project", "project_id": project_id},
        )
        resp = client.get(
            f"/api/v1/tasks/?project_id={project_id}",
            headers={"Authorization": f"Bearer {task_user['token']}"},
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data) >= 1
        assert any(t["project_id"] == project_id for t in data)


class TestReportGeneration:
    """Tests for background report generation."""

    @patch("app.tasks.generate_report.delay")
    def test_request_report_returns_202(self, mock_delay, client, task_user):
        """POST reports/generate returns 202 with task_id."""
        mock_task = MagicMock()
        mock_task.id = "celery-task-id-123"
        mock_delay.return_value = mock_task

        resp = client.post(
            "/api/v1/tasks/reports/generate",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"report_type": "task_summary"},
        )
        assert resp.status_code == 202
        data = resp.get_json()
        assert data["message"] == "Report generation started"
        assert data["task_id"] == "celery-task-id-123"
        mock_delay.assert_called_once_with(int(task_user["id"]), "task_summary")

    @patch("app.tasks.generate_report.delay")
    def test_request_report_default_type(self, mock_delay, client, task_user):
        """Report with default type uses task_summary."""
        mock_task = MagicMock()
        mock_task.id = "default-task-id"
        mock_delay.return_value = mock_task

        resp = client.post(
            "/api/v1/tasks/reports/generate",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={},
        )
        assert resp.status_code == 202
        mock_delay.assert_called_once_with(int(task_user["id"]), "task_summary")

    def test_request_report_invalid_type_returns_400(self, client, task_user):
        """Invalid report_type returns 400."""
        resp = client.post(
            "/api/v1/tasks/reports/generate",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"report_type": "invalid_type"},
        )
        assert resp.status_code == 400


class TestTaskCaching:
    """Tests for Redis caching behavior."""

    def test_list_tasks_cached(self, client, task_user):
        """Repeated GET returns same data (cache hit)."""
        client.post(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
            json={"title": "Cached Task"},
        )
        resp1 = client.get(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
        )
        resp2 = client.get(
            "/api/v1/tasks/",
            headers={"Authorization": f"Bearer {task_user['token']}"},
        )
        assert resp1.status_code == 200 and resp2.status_code == 200
        # Both should return the task (cache stores same result)
        assert len(resp1.get_json()) == len(resp2.get_json())


class TestTaskModel:
    """Tests for Task model indexes."""

    def test_task_model_has_table_args(self):
        """Task model defines indexes for optimization."""
        assert hasattr(Task, "__table_args__")
        indexes = [idx.name for idx in Task.__table__.indexes]
        assert "idx_task_owner_status" in indexes or any("owner" in n for n in indexes)
        assert "idx_task_priority" in indexes


class TestCeleryTasks:
    """Tests for Celery background tasks."""

    def test_generate_report_task_summary(self, app, task_user):
        """generate_report task_summary returns correct structure."""
        from app.tasks import generate_report

        with app.app_context():
            # Create a task for the user
            task = Task(
                title="Report Task",
                status="pending",
                priority="medium",
                owner_id=int(task_user["id"]),
            )
            db.session.add(task)
            db.session.commit()

            result = generate_report.apply(args=[int(task_user["id"]), "task_summary"]).get()
            assert result["report_type"] == "task_summary"
            assert result["user_id"] == int(task_user["id"])
            assert result["total_tasks"] >= 1
            assert "by_status" in result
            assert "pending" in result["by_status"]

    def test_generate_report_project_summary(self, app, task_user):
        """generate_report project_summary returns correct structure."""
        from app.tasks import generate_report

        with app.app_context():
            result = generate_report.apply(args=[int(task_user["id"]), "project_summary"]).get()
            assert result["report_type"] == "project_summary"
            assert result["user_id"] == int(task_user["id"])
            assert "project_count" in result
            assert "projects" in result

    def test_generate_report_unknown_type(self, app, task_user):
        """generate_report unknown type returns error."""
        from app.tasks import generate_report

        with app.app_context():
            result = generate_report.apply(args=[int(task_user["id"]), "unknown"]).get()
            assert result["report_type"] == "unknown"
            assert "error" in result

    def test_send_email_notification(self, app):
        """send_email_notification returns success message (no MAIL_SERVER configured)."""
        from app.tasks import send_email_notification

        result = send_email_notification.apply(
            args=["test@example.com", "Test Subject", "Test body"]
        ).get()
        assert "Email sent to test@example.com" in result
