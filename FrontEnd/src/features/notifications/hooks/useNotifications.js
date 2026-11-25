/*
 * TODO: Expose notification queries and mark-read mutation with cache updates.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NOTIFICATION_QUERY_KEY } from "../../../lib/constants.js";
import {
  listNotifications,
  markNotificationAsRead,
} from "../api/notificationsApi.js";

export function useNotifications(userId) {
  const queryClient = useQueryClient();
  const queryKey = [...NOTIFICATION_QUERY_KEY, userId];
  const notifications = useQuery({
    queryKey,
    queryFn: () => listNotifications(userId),
    enabled: userId !== undefined && userId !== null && userId !== "",
  });

  const markRead = useMutation({
    mutationFn: (notificationId) =>
      markNotificationAsRead(userId, notificationId),
    onSuccess: (_result, notificationId) => {
      queryClient.setQueryData(queryKey, (current = []) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification,
        ),
      );
    },
  });

  return {
    ...notifications,
    notifications: notifications.data ?? [],
    markAsRead: markRead.mutateAsync,
    isMarkingRead: markRead.isPending,
    markReadError: markRead.error,
  };
}

export default useNotifications;