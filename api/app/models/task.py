"""Task model."""

from sqlalchemy import Index

from app import db


class Task(db.Model):
    """Task model for task management."""

    __tablename__ = "tasks"
    __table_args__ = (
        Index("idx_task_owner_status", "owner_id", "status"),
        Index("idx_task_assignee_status", "assignee_id", "status"),
        Index("idx_task_priority", "priority"),
        Index("idx_task_project_id", "project_id"),
    )

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(50), default="pending", nullable=False)
    priority = db.Column(db.String(50), default="medium", nullable=False)
    due_date = db.Column(db.DateTime)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"))
    assignee_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(
        db.DateTime,
        default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
    )

    owner = db.relationship("User", foreign_keys=[owner_id], backref=db.backref("owned_tasks", lazy="dynamic"))
    project = db.relationship("Project", backref=db.backref("tasks", lazy="dynamic"))
    assignee = db.relationship("User", foreign_keys=[assignee_id], backref=db.backref("assigned_tasks", lazy="dynamic"))

    def __repr__(self) -> str:
        return f"<Task {self.title}>"
