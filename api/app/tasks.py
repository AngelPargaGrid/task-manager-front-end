"""Celery background tasks."""

from app.celery_app import celery


@celery.task(bind=True)
def send_email_notification(self, user_email: str, subject: str, body: str) -> str:
    """Send email notification to user (background task)."""
    try:
        from flask import has_app_context, current_app
        from app import create_app
        app = current_app._get_current_object() if has_app_context() else create_app()
        with app.app_context():
            if app.config.get("MAIL_SERVER"):
                from flask_mail import Mail, Message
                mail = Mail(app)
                msg = Message(subject=subject, recipients=[user_email], body=body)
                mail.send(msg)
            # If mail not configured, simulate success (e.g. for dev/test)
        return f"Email sent to {user_email}"
    except Exception as e:
        return f"Failed to send email to {user_email}: {str(e)}"


@celery.task(bind=True)
def generate_report(self, user_id: int, report_type: str) -> dict:
    """Generate a report in the background."""
    from flask import has_app_context, current_app
    from app import create_app, db
    from app.models.task import Task
    from app.models.project import Project
    from app.models.project import ProjectMember

    app = current_app._get_current_object() if has_app_context() else create_app()
    with app.app_context():
        if report_type == "task_summary":
            from sqlalchemy import or_, select
            user_projects_stmt = select(ProjectMember.project_id).where(
                ProjectMember.user_id == user_id
            )
            tasks = Task.query.filter(
                (Task.owner_id == user_id)
                | (Task.assignee_id == user_id)
                | Task.project_id.in_(user_projects_stmt)
            ).all()
            by_status = {}
            for t in tasks:
                by_status[t.status] = by_status.get(t.status, 0) + 1
            return {
                "user_id": user_id,
                "report_type": report_type,
                "total_tasks": len(tasks),
                "by_status": by_status,
            }
        elif report_type == "project_summary":
            projects = Project.query.filter_by(owner_id=user_id).all()
            return {
                "user_id": user_id,
                "report_type": report_type,
                "project_count": len(projects),
                "projects": [{"id": p.id, "name": p.name} for p in projects],
            }
        return {"user_id": user_id, "report_type": report_type, "error": "Unknown report type"}
