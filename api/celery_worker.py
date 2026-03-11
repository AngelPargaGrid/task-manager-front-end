"""
Celery worker entry point.
Run: celery -A celery_worker worker -l info

Requires Redis: CELERY_BROKER_URL=redis://localhost:6379/0
"""

from app.celery_app import celery

app = celery
