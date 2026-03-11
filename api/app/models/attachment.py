"""Attachment model (PRD 7.5)."""

from app import db


class Attachment(db.Model):
    """File attachment on ticket or comment."""

    __tablename__ = "attachments"

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False)
    comment_id = db.Column(db.Integer, db.ForeignKey("comments.id", ondelete="CASCADE"))
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    file_type = db.Column(db.String(50), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    comment = db.relationship("Comment", backref=db.backref("attachments", lazy="dynamic"))

    def __repr__(self) -> str:
        return f"<Attachment {self.filename}>"
