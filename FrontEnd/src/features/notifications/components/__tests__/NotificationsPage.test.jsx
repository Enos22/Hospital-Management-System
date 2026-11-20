import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useNotifications: vi.fn(),
  markAsRead: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("../../../../lib/auth/AuthContext.jsx", () => ({
  useAuth: mocks.useAuth,
}));
vi.mock("../../../../components/feedback/ToastProvider.jsx", () => ({
  useToast: () => ({ error: mocks.toastError, success: vi.fn(), dismiss: vi.fn() }),
}));
vi.mock("../../hooks/useNotifications.js", () => ({
  useNotifications: mocks.useNotifications,
}));

import NotificationsPage from "../../../../pages/NotificationsPage.jsx";

describe("NotificationsPage account scoping", () => {
  beforeEach(() => {
    mocks.useAuth.mockReset();
    mocks.useNotifications.mockReset();
    mocks.markAsRead.mockReset();
    mocks.toastError.mockReset();
    mocks.useAuth.mockReturnValue({ user: { id: 42, role: "patient" } });
    mocks.useNotifications.mockReturnValue({
      notifications: [
        {
          id: 17,
          user_id: 42,
          message: "Appointment reminder",
          is_read: false,
          created_at: "2026-01-01T10:00:00",
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      markAsRead: mocks.markAsRead,
    });
  });

  it("loads and marks read using the signed-in user's ID", async () => {
    render(<NotificationsPage />);

    expect(mocks.useNotifications).toHaveBeenCalledWith(42);
    fireEvent.click(screen.getByRole("button", { name: /mark notification as read/i }));
    await waitFor(() => expect(mocks.markAsRead).toHaveBeenCalledWith(17));
  });

  it("does not fetch when the signed-in user has no account ID", () => {
    mocks.useAuth.mockReturnValue({ user: { role: "patient" } });
    render(<NotificationsPage />);

    expect(screen.getByRole("heading", { name: "Sign in to view notifications" }))
      .toBeInTheDocument();
    expect(mocks.useNotifications).toHaveBeenCalledWith(undefined);
  });
});
