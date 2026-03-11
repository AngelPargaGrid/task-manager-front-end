"""Flask-SocketIO event handlers for real-time notifications."""

from flask import request
from flask_jwt_extended import decode_token
from flask_socketio import join_room, leave_room, emit

from app import socketio
from app.models.notification import Notification
from app.schemas.notification import NotificationSchema

notification_schema = NotificationSchema()


def emit_notification(notification: Notification):
    """Emit a notification to the user's room via WebSocket."""
    room = f"user_{notification.user_id}"
    payload = notification_schema.dump(notification)
    socketio.emit("notification", payload, room=room)


@socketio.on("connect")
def handle_connect():
    """On WebSocket connect, verify JWT and join user room."""
    token = request.args.get("token") or (
        request.headers.get("Authorization") or ""
    ).replace("Bearer ", "").strip()
    if not token:
        return False
    try:
        decoded = decode_token(token)
        user_id = decoded.get("sub")
        if user_id:
            room = f"user_{user_id}"
            join_room(room)
            request.sid_user_id = user_id
            emit("connected", {"user_id": user_id})
            return True
    except Exception:
        pass
    return False


@socketio.on("disconnect")
def handle_disconnect():
    """On disconnect, leave the user room."""
    user_id = getattr(request, "sid_user_id", None)
    if user_id:
        leave_room(f"user_{user_id}")
