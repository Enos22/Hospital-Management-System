/*
 * TODO: Render notifications for the authenticated user's account ID.
 */
export function NotificationList({ notifications = [] }) {
  if (!notifications.length) return <p>No notifications yet.</p>;

  return (
    <ul>
      {notifications.map((n) => (
        <li key={n.id || n._id}>
          {n.message || n.title || "Notification"}
        </li>
      ))}
    </ul>
  );
}
