"""Comment model (PRD 7.2)."""

from app import db


class Comment(db.Model):
    """Comment on a ticket."""

    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_internal = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship("User", backref=db.backref("comments", lazy="dynamic"))

    def __repr__(self) -> str:
        return f"<Comment {self.id} on ticket {self.ticket_id}>"
