"""Project schemas for serialization and validation."""

from marshmallow import fields, validate
from flask_marshmallow import Schema

ROLE_CHOICES = ["owner", "member", "viewer"]


class ProjectSchema(Schema):
    """Project response schema."""

    class Meta:
        ordered = True

    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    description = fields.Str()
    owner_id = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class ProjectCreateSchema(Schema):
    """Schema for creating a project."""

    name = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    description = fields.Str()


class ProjectUpdateSchema(Schema):
    """Schema for updating a project."""

    name = fields.Str(validate=validate.Length(min=1, max=200))
    description = fields.Str()


class ProjectMemberSchema(Schema):
    """Schema for project member."""

    class Meta:
        ordered = True

    user_id = fields.Int()
    project_id = fields.Int()
    role = fields.Str(validate=validate.OneOf(ROLE_CHOICES))
    username = fields.Str(dump_only=True)
    email = fields.Email(dump_only=True)


class ProjectMemberAddSchema(Schema):
    """Schema for adding a project member."""

    user_id = fields.Int(required=True)
    role = fields.Str(
        load_default="member",
        validate=validate.OneOf(ROLE_CHOICES),
    )
