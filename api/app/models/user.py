"""User model (PRD 7.3)."""

import bcrypt
from werkzeug.security import check_password_hash as werkzeug_check_password

from app import db


class User(db.Model):
    """User model for authentication and support roles."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), unique=True, nullable=True, index=True)  # optional, for compatibility
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default="customer", nullable=False)  # customer, agent, admin
    availability_status = db.Column(db.String(20), default="offline")  # available, busy, offline (agents)
    expertise_areas = db.Column(db.JSON)  # e.g. ["technical", "billing"]
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(
        db.DateTime,
        default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
    )

    def set_password(self, password: str) -> None:
        """Hash and set the user password (PRD NFR-005: bcrypt, cost 12)."""
        self.password_hash = bcrypt.hashpw(
            password.encode("utf-8"), bcrypt.gensalt(rounds=12)
        ).decode("utf-8")

    def check_password(self, password: str) -> bool:
        """Verify the password against the stored hash."""
        ph = self.password_hash
        if not ph:
            return False
        if ph.startswith("pbkdf2:"):
            return werkzeug_check_password(ph, password)
        try:
            return bcrypt.checkpw(
                password.encode("utf-8"), ph.encode("utf-8")
            )
        except (ValueError, TypeError):
            return False

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role})>"
