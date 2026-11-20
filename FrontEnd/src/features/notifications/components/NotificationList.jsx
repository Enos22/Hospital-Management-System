/*
 * TODO: Render notifications for the authenticated user's account ID.
 */
import Button from "../../../components/ui/Button.jsx";
import EmptyState from "../../../components/feedback/EmptyState.jsx";
import { formatDate } from "../../../lib/format/formatDate.js";

export default function NotificationList({
  notifications = [],
  onMarkRead,
  markingId = null,
}) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        title="You're all caught up"
        description="New notifications will appear here."
      />
    );
  }

  return (
    <ul className="notification-list">
      {notifications.map((notification) => (
        <li
          className={`notification-item${notification.is_read ? "" : " notification-item-unread"}`}
          key={notification.id}
        >
          <div className="notification-copy">
            <p>{notification.message}</p>
            <time dateTime={notification.created_at}>
              {formatDate(notification.created_at, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </time>
          </div>
          {!notification.is_read && onMarkRead && (
            <Button
              variant="secondary"
              size="small"
              onClick={() => onMarkRead?.(notification.id)}
              loading={markingId === notification.id}
              aria-label={`Mark notification as read: ${notification.message}`}
            >
              Mark read
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}