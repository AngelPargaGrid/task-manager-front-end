"""Notification endpoints."""

from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models.notification import Notification
from app.schemas.notification import NotificationSchema

ns = Namespace("notifications", description="User notifications")

notification_schema = NotificationSchema()


@ns.route("/")
class NotificationList(Resource):
    """List and manage notifications."""

    @ns.doc("list_notifications")
    @ns.response(200, "Success")
    @ns.response(401, "Not authenticated")
    @jwt_required()
    def get(self):
        """List notifications for the current user."""
        user_id = int(get_jwt_identity())
        unread_only = request.args.get("unread", "").lower() == "true"
        query = (
            Notification.query.filter_by(user_id=user_id)
            .order_by(Notification.created_at.desc())
            .limit(50)
        )
        if unread_only:
            query = query.filter_by(read=False)
        notifications = query.all()
        return notification_schema.dump(notifications, many=True), 200


@ns.route("/<int:notification_id>")
@ns.param("notification_id", "Notification ID")
class NotificationDetail(Resource):
    """Get or mark a notification as read."""

    @ns.doc("get_notification")
    @ns.response(200, "Success")
    @ns.response(403, "Forbidden")
    @ns.response(404, "Not found")
    @jwt_required()
    def get(self, notification_id):
        """Get a notification by ID."""
        user_id = int(get_jwt_identity())
        notification = Notification.query.get_or_404(notification_id)
        if notification.user_id != user_id:
            return {"message": "Access denied"}, 403
        return notification_schema.dump(notification), 200

    @ns.doc("mark_notification_read")
    @ns.response(200, "Notification marked as read")
    @ns.response(403, "Forbidden")
    @ns.response(404, "Not found")
    @jwt_required()
    def patch(self, notification_id):
        """Mark a notification as read."""
        user_id = int(get_jwt_identity())
        notification = Notification.query.get_or_404(notification_id)
        if notification.user_id != user_id:
            return {"message": "Access denied"}, 403
        notification.read = True
        db.session.commit()
        return notification_schema.dump(notification), 200


@ns.route("/read-all")
class NotificationReadAll(Resource):
    """Mark all notifications as read."""

    @ns.doc("mark_all_read")
    @ns.response(200, "All notifications marked as read")
    @ns.response(401, "Not authenticated")
    @jwt_required()
    def post(self):
        """Mark all notifications as read for the current user."""
        user_id = int(get_jwt_identity())
        Notification.query.filter_by(user_id=user_id, read=False).update({"read": True})
        db.session.commit()
        return {"message": "All notifications marked as read"}, 200
