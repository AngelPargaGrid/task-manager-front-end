"""Marshmallow schemas."""

from app.schemas.user import (
    UserSchema,
    UserCreateSchema,
    UserLoginSchema,
    UserUpdateSchema,
)
from app.schemas.ticket import (
    TicketSchema,
    TicketCreateSchema,
    TicketUpdateSchema,
    StatusUpdateSchema,
    PriorityUpdateSchema,
    AssignSchema,
)
from app.schemas.comment import CommentSchema, CommentCreateSchema
from app.schemas.notification import NotificationSchema

__all__ = [
    "UserSchema",
    "UserCreateSchema",
    "UserLoginSchema",
    "UserUpdateSchema",
    "TicketSchema",
    "TicketCreateSchema",
    "TicketUpdateSchema",
    "StatusUpdateSchema",
    "PriorityUpdateSchema",
    "AssignSchema",
    "CommentSchema",
    "CommentCreateSchema",
    "NotificationSchema",
]
