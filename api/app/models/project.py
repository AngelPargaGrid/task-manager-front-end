"""Project model and project membership."""

from app import db


class Project(db.Model):
    """Project model for project management."""

    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(
        db.DateTime,
        default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
    )

    owner = db.relationship("User", foreign_keys=[owner_id], backref=db.backref("owned_projects", lazy="dynamic"))
    member_associations = db.relationship(
        "ProjectMember",
        back_populates="project",
        cascade="all, delete-orphan",
    )

    @property
    def members(self):
        """Return list of member users."""
        return [pm.user for pm in self.member_associations]

    def __repr__(self) -> str:
        return f"<Project {self.name}>"


class ProjectMember(db.Model):
    """Association table for project membership with role."""

    __tablename__ = "project_members"

    project_id = db.Column(db.Integer, db.ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role = db.Column(db.String(50), default="member")  # owner, member, viewer

    project = db.relationship("Project", back_populates="member_associations")
    user = db.relationship("User", backref=db.backref("project_member_associations", lazy="dynamic"))
