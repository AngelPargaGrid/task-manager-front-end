"""Ticket schemas with comprehensive validation (PRD FR-001, NFR-013)."""

from marshmallow import fields, validate, validates, ValidationError as MarshmallowValidationError
from flask_marshmallow import Schema


PRIORITY_CHOICES = ["low", "medium", "high", "urgent"]
CATEGORY_CHOICES = ["technical", "billing", "general", "feature_request"]
STATUS_CHOICES = ["open", "assigned", "in_progress", "waiting", "resolved", "closed", "reopened"]

# PRD FR-012: Valid status transitions
VALID_STATUS_TRANSITIONS = {
    "open": ["assigned", "closed"],
    "assigned": ["in_progress", "closed"],
    "in_progress": ["waiting", "resolved", "closed"],
    "waiting": ["in_progress"],
    "resolved": ["closed", "reopened"],
    "closed": ["reopened"],
    "reopened": ["in_progress"],
}


class TicketSchema(Schema):
    """Ticket response schema."""

    class Meta:
        ordered = True

    id = fields.Int(dump_only=True)
    ticket_number = fields.Str(dump_only=True)
    subject = fields.Str()
    description = fields.Str()
    status = fields.Str()
    priority = fields.Str()
    category = fields.Str()
    customer_email = fields.Email()
    created_by_id = fields.Int(dump_only=True)
    assigned_to_id = fields.Int()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    resolved_at = fields.DateTime(dump_only=True)
    closed_at = fields.DateTime(dump_only=True)


class TicketCreateSchema(Schema):
    """Schema for creating a ticket (FR-001)."""

    subject = fields.Str(
        required=True,
        validate=validate.Length(min=5, max=200),
        error_messages={"validator_failed": "Subject must be 5-200 characters"},
    )
    description = fields.Str(
        required=True,
        validate=validate.Length(min=20, max=5000),
        error_messages={"validator_failed": "Description must be at least 20 characters"},
    )
    priority = fields.Str(
        load_default="medium",
        validate=validate.OneOf(PRIORITY_CHOICES),
        error_messages={"validator_failed": "Invalid priority level"},
    )
    category = fields.Str(
        required=True,
        validate=validate.OneOf(CATEGORY_CHOICES),
        error_messages={"validator_failed": "Invalid category"},
    )
    customer_email = fields.Email(
        required=True,
        error_messages={"invalid": "Invalid email format"},
    )


class TicketUpdateSchema(Schema):
    """Schema for updating a ticket (partial)."""

    subject = fields.Str(validate=validate.Length(min=5, max=200))
    description = fields.Str(validate=validate.Length(min=20, max=5000))
    priority = fields.Str(validate=validate.OneOf(PRIORITY_CHOICES))
    category = fields.Str(validate=validate.OneOf(CATEGORY_CHOICES))


class StatusUpdateSchema(Schema):
    """Schema for status updates with transition validation."""

    status = fields.Str(
        required=True,
        validate=validate.OneOf(STATUS_CHOICES),
    )

    def validate_status_transition(self, data, current_status):
        """Validate status transition per PRD FR-012."""
        new_status = data.get("status")
        if not new_status or new_status == current_status:
            return
        allowed = VALID_STATUS_TRANSITIONS.get(current_status, [])
        if new_status not in allowed:
            raise MarshmallowValidationError(
                f"Invalid status transition: {current_status} → {new_status}. "
                f"Allowed: {', '.join(allowed)}"
            )


class PriorityUpdateSchema(Schema):
    """Schema for priority updates (FR-024: requires reason)."""

    priority = fields.Str(required=True, validate=validate.OneOf(PRIORITY_CHOICES))
    reason = fields.Str(required=True, validate=validate.Length(min=5))


class AssignSchema(Schema):
    """Schema for assigning a ticket."""

    agent_id = fields.Int(required=True)
