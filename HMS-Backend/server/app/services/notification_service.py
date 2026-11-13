from app.extensions import db
from app.models.notification import Notification


def create_notification(user_id, message):
    notification = Notification(
        user_id=user_id,
        message=message
    )

    db.session.add(notification)
    db.session.commit()

    return notification


def get_user_notifications(user_id):
    return Notification.query.filter_by(
        user_id=user_id
    ).order_by(Notification.created_at.desc()).all()


def mark_notification_as_read(notification_id, user_id):
    notification = Notification.query.filter_by(
        id=notification_id,
        user_id=user_id
    ).first()

    if notification is None:
        return None

    notification.is_read = True
    db.session.commit()

    return notification