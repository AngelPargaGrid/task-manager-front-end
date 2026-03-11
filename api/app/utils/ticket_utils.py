"""Ticket utility functions (PRD FR-002)."""

from datetime import datetime

from app import db
from app.models.ticket import Ticket


def generate_ticket_number() -> str:
    """Generate unique ticket number: TICK-YYYYMMDD-XXXX (PRD FR-002)."""
    today = datetime.utcnow().strftime("%Y%m%d")
    prefix = f"TICK-{today}-"

    last = (
        Ticket.query.filter(Ticket.ticket_number.like(f"{prefix}%"))
        .order_by(Ticket.id.desc())
        .first()
    )
    if last:
        try:
            seq = int(last.ticket_number.split("-")[-1]) + 1
        except (ValueError, IndexError):
            seq = 1
    else:
        seq = 1

    return f"{prefix}{seq:04d}"
