/*
 * TODO: Implement user-scoped notification list and mark-read requests.
 */
import { apiRequest } from "../../../lib/api/client.js";

function requireUserId(userId) {
  if (userId === undefined || userId === null || userId === "") {
    throw new TypeError("A user ID is required to access notifications.");
  }
  return encodeURIComponent(userId);
}

export function listNotifications(userId) {
  return apiRequest(`/api/notifications/${requireUserId(userId)}`);
}

export function markNotificationAsRead(userId, notificationId) {
  return apiRequest(
    `/api/notifications/${requireUserId(userId)}/${encodeURIComponent(notificationId)}/read`,
    { method: "PATCH" },
  );
}
