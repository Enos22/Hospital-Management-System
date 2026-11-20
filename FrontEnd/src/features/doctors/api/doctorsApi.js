/*
 * TODO: Implement doctor directory/account requests and endpoint response mapping.
 */
import { apiRequest } from "../../../lib/api/client";

export function listDoctors({ signal } = {}) {
  return apiRequest("/api/doctors", { signal });
}

export function getDoctor(userId, { signal } = {}) {
  return apiRequest(`/api/doctors/${encodeURIComponent(userId)}`, { signal });
}

export function createDoctor(data) {
  return apiRequest("/api/doctors", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateDoctor(userId, data) {
  return apiRequest(`/api/doctors/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteDoctor(userId) {
  return apiRequest(`/api/doctors/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
}