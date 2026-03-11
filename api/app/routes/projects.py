"""Project endpoints."""

from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app import db
from app.models.project import Project, ProjectMember
from app.models.task import Task
from app.models.user import User
from app.models.notification import Notification
from app.socketio_events import emit_notification
from app.schemas.project import (
    ProjectSchema,
    ProjectCreateSchema,
    ProjectUpdateSchema,
    ProjectMemberSchema,
    ProjectMemberAddSchema,
)
from app.schemas.task import TaskSchema

ns = Namespace("projects", description="Project management")

project_schema = ProjectSchema()
project_create_schema = ProjectCreateSchema()
project_update_schema = ProjectUpdateSchema()
project_member_schema = ProjectMemberSchema()
project_member_add_schema = ProjectMemberAddSchema()
task_schema = TaskSchema()


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


def _can_access_project(user_id: int, project: Project) -> bool:
    """Check if user can access the project."""
    if project.owner_id == user_id:
        return True
    pm = ProjectMember.query.filter_by(project_id=project.id, user_id=user_id).first()
    return pm is not None


def _can_edit_project(user_id: int, project: Project) -> bool:
    """Check if user can edit the project."""
    if project.owner_id == user_id:
        return True
    pm = ProjectMember.query.filter_by(project_id=project.id, user_id=user_id).first()
    return pm is not None and pm.role in ("owner", "member")


@ns.route("/")
class ProjectList(Resource):
    """List and create projects."""

    @ns.doc("list_projects")
    @ns.response(200, "Success")
    @ns.response(401, "Not authenticated")
    @jwt_required()
    def get(self):
        """List projects the user owns or is a member of."""
        user_id = int(get_jwt_identity())
        owned = Project.query.filter_by(owner_id=user_id).all()
        member_ids = db.session.query(ProjectMember.project_id).filter(
            ProjectMember.user_id == user_id
        ).all()
        member_ids = [m[0] for m in member_ids]
        member_projects = Project.query.filter(Project.id.in_(member_ids)).all() if member_ids else []
        seen = {p.id for p in owned}
        all_projects = list(owned) + [p for p in member_projects if p.id not in seen]
        return project_schema.dump(all_projects, many=True), 200

    @ns.doc("create_project")
    @ns.response(201, "Project created")
    @ns.response(400, "Validation error")
    @jwt_required()
    def post(self):
        """Create a new project."""
        try:
            data = project_create_schema.load(request.get_json())
        except ValidationError as err:
            return {"errors": err.messages}, 400

        user_id = int(get_jwt_identity())
        project = Project(
            name=data["name"],
            description=data.get("description"),
            owner_id=user_id,
        )
        db.session.add(project)
        db.session.flush()
        pm = ProjectMember(project_id=project.id, user_id=user_id, role="owner")
        db.session.add(pm)
        db.session.commit()
        return project_schema.dump(project), 201


@ns.route("/<int:project_id>")
@ns.param("project_id", "Project ID")
class ProjectDetail(Resource):
    """Get, update, delete a project."""

    @ns.doc("get_project")
    @ns.response(200, "Success")
    @ns.response(403, "Forbidden")
    @ns.response(404, "Project not found")
    @jwt_required()
    def get(self, project_id):
        """Get a project by ID."""
        user_id = int(get_jwt_identity())
        project = Project.query.get_or_404(project_id)
        if not _can_access_project(user_id, project):
            return {"message": "Access denied"}, 403
        return project_schema.dump(project), 200

    @ns.doc("update_project")
    @ns.response(200, "Project updated")
    @ns.response(400, "Validation error")
    @ns.response(403, "Forbidden")
    @ns.response(404, "Project not found")
    @jwt_required()
    def put(self, project_id):
        """Update a project."""
        user_id = int(get_jwt_identity())
        project = Project.query.get_or_404(project_id)
        if not _can_edit_project(user_id, project):
            return {"message": "Access denied"}, 403

        try:
            data = project_update_schema.load(request.get_json(), partial=True)
        except ValidationError as err:
            return {"errors": err.messages}, 400

        for key, value in data.items():
            setattr(project, key, value)
        db.session.commit()

        to_notify = []
        for pm in project.member_associations:
            if pm.user_id != user_id:
                n = _create_notification(
                    pm.user_id,
                    f"Project '{project.name}' was updated",
                    "project",
                    project.id,
                )
                to_notify.append(n)
        db.session.commit()
        for n in to_notify:
            emit_notification(n)
        return project_schema.dump(project), 200

    @ns.doc("delete_project")
    @ns.response(204, "Project deleted")
    @ns.response(403, "Forbidden")
    @ns.response(404, "Project not found")
    @jwt_required()
    def delete(self, project_id):
        """Delete a project."""
        user_id = int(get_jwt_identity())
        project = Project.query.get_or_404(project_id)
        if project.owner_id != user_id:
            return {"message": "Only the owner can delete the project"}, 403
        db.session.delete(project)
        db.session.commit()
        return "", 204


@ns.route("/<int:project_id>/tasks")
@ns.param("project_id", "Project ID")
class ProjectTasks(Resource):
    """List tasks in a project."""

    @ns.doc("list_project_tasks")
    @ns.response(200, "Success")
    @ns.response(403, "Forbidden")
    @ns.response(404, "Project not found")
    @jwt_required()
    def get(self, project_id):
        """List all tasks in a project."""
        user_id = int(get_jwt_identity())
        project = Project.query.get_or_404(project_id)
        if not _can_access_project(user_id, project):
            return {"message": "Access denied"}, 403
        tasks = Task.query.filter_by(project_id=project_id).order_by(Task.created_at.desc()).all()
        return task_schema.dump(tasks, many=True), 200


@ns.route("/<int:project_id>/members")
@ns.param("project_id", "Project ID")
class ProjectMembersList(Resource):
    """List and add project members (team collaboration)."""

    @ns.doc("list_project_members")
    @ns.response(200, "Success")
    @ns.response(403, "Forbidden")
    @ns.response(404, "Project not found")
    @jwt_required()
    def get(self, project_id):
        """List all members of a project."""
        user_id = int(get_jwt_identity())
        project = Project.query.get_or_404(project_id)
        if not _can_access_project(user_id, project):
            return {"message": "Access denied"}, 403

        result = []
        for pm in project.member_associations:
            user = User.query.get(pm.user_id)
            result.append({
                "user_id": pm.user_id,
                "project_id": pm.project_id,
                "role": pm.role,
                "username": user.username if user else None,
                "email": user.email if user else None,
            })
        return result, 200

    @ns.doc("add_project_member")
    @ns.response(201, "Member added")
    @ns.response(400, "Validation error")
    @ns.response(403, "Forbidden")
    @ns.response(404, "Project or user not found")
    @jwt_required()
    def post(self, project_id):
        """Add a member to the project."""
        user_id = int(get_jwt_identity())
        project = Project.query.get_or_404(project_id)
        if not _can_edit_project(user_id, project):
            return {"message": "Access denied"}, 403

        try:
            data = project_member_add_schema.load(request.get_json())
        except ValidationError as err:
            return {"errors": err.messages}, 400

        member_user = User.query.get(data["user_id"])
        if not member_user:
            return {"message": "User not found"}, 404

        existing = ProjectMember.query.filter_by(
            project_id=project_id, user_id=data["user_id"]
        ).first()
        if existing:
            return {"message": "User is already a member"}, 409

        pm = ProjectMember(
            project_id=project_id,
            user_id=data["user_id"],
            role=data.get("role", "member"),
        )
        db.session.add(pm)
        n = _create_notification(
            data["user_id"],
            f"You were added to project: {project.name}",
            "project",
            project.id,
        )
        db.session.commit()
        emit_notification(n)
        return {
            "message": "Member added",
            "user_id": pm.user_id,
            "project_id": pm.project_id,
            "role": pm.role,
        }, 201


@ns.route("/<int:project_id>/members/<int:member_user_id>")
@ns.param("project_id", "Project ID")
@ns.param("member_user_id", "User ID of the member")
class ProjectMemberDetail(Resource):
    """Update or remove a project member."""

    @ns.doc("update_project_member")
    @ns.response(200, "Member updated")
    @ns.response(403, "Forbidden")
    @ns.response(404, "Not found")
    @jwt_required()
    def put(self, project_id, member_user_id):
        """Update a member's role."""
        user_id = int(get_jwt_identity())
        project = Project.query.get_or_404(project_id)
        if not _can_edit_project(user_id, project):
            return {"message": "Access denied"}, 403
        if project.owner_id == member_user_id:
            return {"message": "Cannot change owner role"}, 400

        pm = ProjectMember.query.filter_by(
            project_id=project_id, user_id=member_user_id
        ).first_or_404()
        data = request.get_json() or {}
        if "role" in data and data["role"] in ("owner", "member", "viewer"):
            pm.role = data["role"]
        db.session.commit()
        return {"user_id": pm.user_id, "project_id": pm.project_id, "role": pm.role}, 200

    @ns.doc("remove_project_member")
    @ns.response(204, "Member removed")
    @ns.response(403, "Forbidden")
    @ns.response(404, "Not found")
    @jwt_required()
    def delete(self, project_id, member_user_id):
        """Remove a member from the project."""
        user_id = int(get_jwt_identity())
        project = Project.query.get_or_404(project_id)
        if project.owner_id == member_user_id:
            return {"message": "Cannot remove project owner"}, 400
        if user_id != project.owner_id and user_id != member_user_id:
            return {"message": "Access denied"}, 403

        pm = ProjectMember.query.filter_by(
            project_id=project_id, user_id=member_user_id
        ).first_or_404()
        db.session.delete(pm)
        db.session.commit()
        return "", 204
