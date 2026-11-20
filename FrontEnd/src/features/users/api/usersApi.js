/*
 * TODO: Implement admin user-list and role-update requests and response mapping.
 */
import { apiRequest } from "../../../lib/api/client";

export async function listUsers({
  role = "",
  page = 1,
  perPage = 20,
  signal,
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  if (role) params.set("role", role);

  const response = await apiRequest(`/api/admin/users?${params}`, { signal });

  // Backend shape: { users, total, page, pages, per_page }
  return {
    items: Array.isArray(response?.users) ? response.users : [],
    pagination: {
      page: response?.page ?? page,
      perPage: response?.per_page ?? perPage,
      total: response?.total ?? 0,
      pages: response?.pages ?? 0,
      hasNext: (response?.page ?? page) < (response?.pages ?? 0),
      hasPrevious: (response?.page ?? page) > 1,
    },
  };
}

export function updateUserRole(userId, role) {
  return apiRequest(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export function deleteUser(userId) {
  return apiRequest(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
}