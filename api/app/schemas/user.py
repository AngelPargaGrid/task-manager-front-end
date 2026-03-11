"""User schemas for serialization and validation."""

from marshmallow import fields, validate
from flask_marshmallow import Schema


class UserSchema(Schema):
    """User response schema."""

    class Meta:
        ordered = True

    id = fields.Int(dump_only=True)
    email = fields.Email(required=True)
    username = fields.Str(required=True)
    is_active = fields.Bool(dump_only=True)
    created_at = fields.DateTime(dump_only=True)


class UserCreateSchema(Schema):
    """Schema for user registration."""

    email = fields.Email(required=True)
    username = fields.Str(required=True, validate=validate.Length(min=3, max=80))
    password = fields.Str(required=True, validate=validate.Length(min=8), load_only=True)


class UserLoginSchema(Schema):
    """Schema for user login."""

    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)
