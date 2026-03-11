"""Assignment model (PRD 7.4) - tracks ticket assignment history."""

from app import db


class Assignment(db.Model):
    """Ticket assignment history."""

    __tablename__ = "assignments"

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False)
    assigned_to_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    assigned_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    assigned_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    assigned_to = db.relationship("User", foreign_keys=[assigned_to_id])
    assigned_by = db.relationship("User", foreign_keys=[assigned_by_id])

    def __repr__(self) -> str:
        return f"<Assignment ticket={self.ticket_id} to={self.assigned_to_id}>"
