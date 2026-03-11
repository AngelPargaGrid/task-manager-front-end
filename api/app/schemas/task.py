"""Task schemas for serialization and validation."""

from marshmallow import fields, validate
from flask_marshmallow import Schema


STATUS_CHOICES = ["pending", "in_progress", "completed"]
PRIORITY_CHOICES = ["low", "medium", "high", "urgent"]


class TaskSchema(Schema):
    """Task response schema."""

    class Meta:
        ordered = True

    id = fields.Int(dump_only=True)
    title = fields.Str(required=True)
    description = fields.Str()
    status = fields.Str()
    priority = fields.Str()
    due_date = fields.DateTime()
    owner_id = fields.Int(dump_only=True)
    project_id = fields.Int()
    assignee_id = fields.Int()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class TaskCreateSchema(Schema):
    """Schema for creating a task."""

    title = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    description = fields.Str()
    status = fields.Str(
        load_default="pending",
        validate=validate.OneOf(STATUS_CHOICES),
    )
    priority = fields.Str(
        load_default="medium",
        validate=validate.OneOf(PRIORITY_CHOICES),
    )
    due_date = fields.DateTime()
    project_id = fields.Int()
    assignee_id = fields.Int()


class TaskUpdateSchema(Schema):
    """Schema for updating a task."""

    title = fields.Str(validate=validate.Length(min=1, max=200))
    description = fields.Str()
    status = fields.Str(validate=validate.OneOf(STATUS_CHOICES))
    priority = fields.Str(validate=validate.OneOf(PRIORITY_CHOICES))
    due_date = fields.DateTime()
    project_id = fields.Int()
    assignee_id = fields.Int()
