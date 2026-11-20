import { useState } from "react";
import ErrorState from "../components/feedback/ErrorState.jsx";
import ForbiddenState from "../components/feedback/ForbiddenState.jsx";
import LoadingState from "../components/feedback/LoadingState.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import NotificationList from "../features/notifications/components/NotificationList.jsx";
import { useNotifications } from "../features/notifications/hooks/useNotifications.js";
import { useToast } from "../components/feedback/ToastProvider.jsx";
import { useAuth } from "../lib/auth/AuthContext.jsx";

export default function NotificationsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [markingId, setMarkingId] = useState(null);
  const userId = user?.id ?? user?.user_id;
  const {
    notifications,
    isLoading,
    isError,
    error,
    refetch,
    markAsRead,
  } = useNotifications(userId);

  if (userId === undefined || userId === null) {
    return (
      <ForbiddenState
        title="Sign in to view notifications"
        message="Your account is required to load your notifications."
      />
    );
  }

  async function handleMarkRead(notificationId) {
    setMarkingId(notificationId);
    try {
      await markAsRead(notificationId);
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Could not update notification.");
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <section className="page-content">
      <PageHeader
        title="Notifications"
        description="Updates and messages for your account."
      />
      {isLoading ? (
        <LoadingState label="Loading notifications" />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <NotificationList
          notifications={notifications}
          onMarkRead={handleMarkRead}
          markingId={markingId}
        />
      )}
    </section>
  );
}
