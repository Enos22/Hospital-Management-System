import { beforeEach, describe, expect, it, vi } from "vitest";

const { request } = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock("../../../../lib/api/client.js", () => ({ request }));

import {
  listNotifications,
  markNotificationAsRead,
} from "../notificationsApi.js";

describe("notifications API ownership paths", () => {
  beforeEach(() => request.mockReset());

  it("requests notifications for the supplied account ID", () => {
    listNotifications(42);
    expect(request).toHaveBeenCalledWith("/api/notifications/42");
  });

  it("marks read only in the supplied account's notification route", () => {
    markNotificationAsRead(42, 17);
    expect(request).toHaveBeenCalledWith(
      "/api/notifications/42/17/read",
      { method: "PATCH" },
    );
  });

  it("rejects a missing account ID before sending a request", () => {
    expect(() => listNotifications(undefined)).toThrow(/user ID is required/i);
    expect(request).not.toHaveBeenCalled();
  });
});
