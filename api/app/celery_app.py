"""Celery application configuration."""

from celery import Celery

celery = Celery(
    "app",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=["app.tasks"],
)
celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
)
