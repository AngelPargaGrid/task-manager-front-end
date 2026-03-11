"""Notification model for real-time notifications."""

from app import db


class Notification(db.Model):
    """Notification model for user notifications."""

    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = db.Column(db.String(500), nullable=False)
    entity_type = db.Column(db.String(50))  # task, project
    entity_id = db.Column(db.Integer)
    read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship("User", backref=db.backref("notifications", lazy="dynamic"))

    def __repr__(self) -> str:
        return f"<Notification {self.id} for user {self.user_id}>"
