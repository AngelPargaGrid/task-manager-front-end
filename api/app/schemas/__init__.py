"""Marshmallow schemas."""

from app.schemas.user import UserSchema, UserCreateSchema, UserLoginSchema
from app.schemas.task import TaskSchema, TaskCreateSchema, TaskUpdateSchema
from app.schemas.project import (
    ProjectSchema,
    ProjectCreateSchema,
    ProjectUpdateSchema,
    ProjectMemberSchema,
    ProjectMemberAddSchema,
)
from app.schemas.notification import NotificationSchema

__all__ = [
    "UserSchema",
    "UserCreateSchema",
    "UserLoginSchema",
    "TaskSchema",
    "TaskCreateSchema",
    "TaskUpdateSchema",
    "ProjectSchema",
    "ProjectCreateSchema",
    "ProjectUpdateSchema",
    "ProjectMemberSchema",
    "ProjectMemberAddSchema",
    "NotificationSchema",
]
