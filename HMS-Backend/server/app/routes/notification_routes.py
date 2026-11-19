from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from app.services.notification_service import (
    get_user_notifications,
    mark_notification_as_read
)

notification_bp = Blueprint(
    "notifications",
    __name__,
    url_prefix="/api/notifications"
)


@notification_bp.route("/<int:user_id>", methods=["GET"])
@jwt_required()
def get_notifications(user_id):
    if str(user_id) != str(get_jwt_identity()) and get_jwt().get("role") != "admin":
        return jsonify({"error": "You are not allowed to view these notifications"}), 403

    notifications = get_user_notifications(user_id)

    return jsonify([
        {
            "id": notification.id,
            "user_id": notification.user_id,
            "message": notification.message,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat()
        }
        for notification in notifications
    ]), 200


@notification_bp.route(
    "/<int:user_id>/<int:notification_id>/read",
    methods=["PATCH"]
)
@jwt_required()
def read_notification(user_id, notification_id):
    if str(user_id) != str(get_jwt_identity()) and get_jwt().get("role") != "admin":
        return jsonify({"error": "You are not allowed to update this notification"}), 403

    notification = mark_notification_as_read(
        notification_id,
        user_id
    )

    if notification is None:
        return jsonify({"error": "Notification not found"}), 404

    return jsonify({
        "message": "Notification marked as read",
        "notification_id": notification.id,
        "is_read": notification.is_read
    }), 200