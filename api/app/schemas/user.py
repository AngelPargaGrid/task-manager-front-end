"""User schemas for serialization and validation (PRD 7.3)."""

from marshmallow import fields, validate
from flask_marshmallow import Schema


ROLE_CHOICES = ["customer", "agent", "admin"]
AVAILABILITY_CHOICES = ["available", "busy", "offline"]


class UserSchema(Schema):
    """User response schema."""

    class Meta:
        ordered = True

    id = fields.Int(dump_only=True)
    name = fields.Str()
    email = fields.Email()
    username = fields.Str()
    role = fields.Str()
    availability_status = fields.Str()
    expertise_areas = fields.List(fields.Str())
    is_active = fields.Bool(dump_only=True)
    created_at = fields.DateTime(dump_only=True)


class UserCreateSchema(Schema):
    """Schema for user registration."""

    name = fields.Str(required=True, validate=validate.Length(min=2, max=255))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8), load_only=True)
    role = fields.Str(load_default="customer", validate=validate.OneOf(ROLE_CHOICES))
    username = fields.Str(validate=validate.Length(min=3, max=80))  # optional


class UserLoginSchema(Schema):
    """Schema for user login."""

    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)


class UserUpdateSchema(Schema):
    """Schema for updating user (admin)."""

    name = fields.Str(validate=validate.Length(min=2, max=255))
    role = fields.Str(validate=validate.OneOf(ROLE_CHOICES))
    availability_status = fields.Str(validate=validate.OneOf(AVAILABILITY_CHOICES))
    expertise_areas = fields.List(fields.Str())
