"""Ticket model (PRD 7.1)."""

from datetime import datetime

from app import db


class Ticket(db.Model):
    """Support ticket model."""

    __tablename__ = "tickets"

    id = db.Column(db.Integer, primary_key=True)
    ticket_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    subject = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), default="open", nullable=False)
    priority = db.Column(db.String(20), default="medium", nullable=False)
    category = db.Column(db.String(50), nullable=False)
    customer_email = db.Column(db.String(255), nullable=False, index=True)
    created_by_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    assigned_to_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(
        db.DateTime,
        default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
    )
    resolved_at = db.Column(db.DateTime)
    closed_at = db.Column(db.DateTime)

    created_by = db.relationship("User", foreign_keys=[created_by_id])
    assigned_to = db.relationship("User", foreign_keys=[assigned_to_id], backref=db.backref("assigned_tickets", lazy="dynamic"))

    comments = db.relationship("Comment", backref="ticket", lazy="dynamic")
    attachments = db.relationship("Attachment", backref="ticket", lazy="dynamic")
    assignments = db.relationship("Assignment", backref="ticket", lazy="dynamic")

    def __repr__(self) -> str:
        return f"<Ticket {self.ticket_number}>"
