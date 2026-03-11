"""Task endpoints."""

from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app import db
from app.models.task import Task
from app.models.project import Project, ProjectMember
from app.models.notification import Notification
from app.schemas.task import TaskSchema, TaskCreateSchema, TaskUpdateSchema
from app.socketio_events import emit_notification

ns = Namespace("tasks", description="Task CRUD operations")

task_schema = TaskSchema()
task_create_schema = TaskCreateSchema()
task_update_schema = TaskUpdateSchema()


def _create_notification(user_id: int, message: str, entity_type: str = None, entity_id: int = None):
    """Create and persist a notification."""
    n = Notification(
        user_id=user_id,
        message=message,
        entity_type=entity_type,
        entity_id=entity_id,
    )
    db.session.add(n)
    return n


def _can_access_task(user_id: int, task: Task) -> bool:
    """Check if user can access the task."""
    if task.owner_id == user_id:
        return True
    if task.assignee_id == user_id:
        return True
    if task.project_id:
        pm = ProjectMember.query.filter_by(project_id=task.project_id, user_id=user_id).first()
        if pm:
            return True
    return False


def _can_edit_task(user_id: int, task: Task) -> bool:
    """Check if user can edit the task."""
    if task.owner_id == user_id:
        return True
    if task.project_id:
        pm = ProjectMember.query.filter_by(project_id=task.project_id, user_id=user_id).first()
        if pm and pm.role in ("owner", "member"):
            return True
    return False


@ns.route("/")
class TaskList(Resource):
    """List and create tasks."""

    @ns.doc("list_tasks")
    @ns.response(200, "Success")
    @ns.response(401, "Not authenticated")
    @jwt_required()
    def get(self):
        """List tasks for the current user (owned, assigned, or in projects)."""
        user_id = int(get_jwt_identity())
        status = request.args.get("status")
        project_id = request.args.get("project_id", type=int)
        priority = request.args.get("priority")

        query = Task.query
        # Filter: user owns, is assignee, or is project member
        from sqlalchemy import or_

        user_projects = db.session.query(ProjectMember.project_id).filter(
            ProjectMember.user_id == user_id
        ).subquery()
        query = query.filter(
            or_(
                Task.owner_id == user_id,
                Task.assignee_id == user_id,
                Task.project_id.in_(user_projects),
            )
        )

        if status:
            query = query.filter(Task.status == status)
        if project_id:
            query = query.filter(Task.project_id == project_id)
        if priority:
            query = query.filter(Task.priority == priority)

        tasks = query.order_by(Task.created_at.desc()).all()
        return task_schema.dump(tasks, many=True), 200

    @ns.doc("create_task")
    @ns.response(201, "Task created")
    @ns.response(400, "Validation error")
    @ns.response(403, "Forbidden")
    @jwt_required()
    def post(self):
        """Create a new task."""
        try:
            data = task_create_schema.load(request.get_json())
        except ValidationError as err:
            return {"errors": err.messages}, 400

        user_id = int(get_jwt_identity())

        if data.get("project_id"):
            project = Project.query.get(data["project_id"])
            if not project:
                return {"message": "Project not found"}, 404
            pm = ProjectMember.query.filter_by(project_id=project.id, user_id=user_id).first()
            if not pm and project.owner_id != user_id:
                return {"message": "Not a member of this project"}, 403

        task = Task(
            title=data["title"],
            description=data.get("description"),
            status=data.get("status", "pending"),
            priority=data.get("priority", "medium"),
            due_date=data.get("due_date"),
            owner_id=user_id,
            project_id=data.get("project_id"),
            assignee_id=data.get("assignee_id"),
        )
        db.session.add(task)
        db.session.commit()

        db.session.commit()
        if task.assignee_id and task.assignee_id != user_id:
            n = _create_notification(
                task.assignee_id,
                f"You were assigned to task: {task.title}",
                "task",
                task.id,
            )
            db.session.commit()
            emit_notification(n)

        return task_schema.dump(task), 201


@ns.route("/<int:task_id>")
@ns.param("task_id", "Task ID")
class TaskDetail(Resource):
    """Get, update, delete a task."""

    @ns.doc("get_task")
    @ns.response(200, "Success")
    @ns.response(404, "Task not found")
    @ns.response(403, "Forbidden")
    @jwt_required()
    def get(self, task_id):
        """Get a task by ID."""
        user_id = int(get_jwt_identity())
        task = Task.query.get_or_404(task_id)
        if not _can_access_task(user_id, task):
            return {"message": "Access denied"}, 403
        return task_schema.dump(task), 200

    @ns.doc("update_task")
    @ns.response(200, "Task updated")
    @ns.response(400, "Validation error")
    @ns.response(403, "Forbidden")
    @ns.response(404, "Task not found")
    @jwt_required()
    def put(self, task_id):
        """Update a task."""
        user_id = int(get_jwt_identity())
        task = Task.query.get_or_404(task_id)
        if not _can_edit_task(user_id, task):
            return {"message": "Access denied"}, 403

        try:
            data = task_update_schema.load(request.get_json(), partial=True)
        except ValidationError as err:
            return {"errors": err.messages}, 400

        old_assignee = task.assignee_id
        for key, value in data.items():
            setattr(task, key, value)
        db.session.commit()

        if "assignee_id" in data and data["assignee_id"] != old_assignee and data["assignee_id"]:
            n = _create_notification(
                data["assignee_id"],
                f"You were assigned to task: {task.title}",
                "task",
                task.id,
            )
            db.session.commit()
            emit_notification(n)

        return task_schema.dump(task), 200

    @ns.doc("delete_task")
    @ns.response(204, "Task deleted")
    @ns.response(403, "Forbidden")
    @ns.response(404, "Task not found")
    @jwt_required()
    def delete(self, task_id):
        """Delete a task."""
        user_id = int(get_jwt_identity())
        task = Task.query.get_or_404(task_id)
        if not _can_edit_task(user_id, task):
            return {"message": "Access denied"}, 403
        db.session.delete(task)
        db.session.commit()
        return "", 204
