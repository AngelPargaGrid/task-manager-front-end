"""Notification schemas for serialization."""

from marshmallow import fields
from flask_marshmallow import Schema


class NotificationSchema(Schema):
    """Notification response schema."""

    class Meta:
        ordered = True

    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    message = fields.Str()
    entity_type = fields.Str()
    entity_id = fields.Int()
    read = fields.Bool()
    created_at = fields.DateTime(dump_only=True)
