"""Comment schemas."""

from marshmallow import fields, validate
from flask_marshmallow import Schema


class CommentSchema(Schema):
    """Comment response schema."""

    class Meta:
        ordered = True

    id = fields.Int(dump_only=True)
    ticket_id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    content = fields.Str()
    is_internal = fields.Bool()
    created_at = fields.DateTime(dump_only=True)


class CommentCreateSchema(Schema):
    """Schema for creating a comment (FR-015, FR-016)."""

    content = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=5000),
    )
    is_internal = fields.Bool(load_default=False)
