/*
 * TODO: Implement patient account/directory requests and response mapping.
 */
import { apiRequest } from "../../../lib/api/client";

export function listPatients({
  search = "",
  page = 1,
  perPage = 10,
  signal,
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  if (search) params.set("search", search);

  return apiRequest(`/api/patients?${params}`, { signal });
}

// The backend route uses User.id, not Patient.id.
export function getPatient(userId, { signal } = {}) {
  return apiRequest(`/api/patients/${encodeURIComponent(userId)}`, { signal });
}

export function createPatient(data) {
  return apiRequest("/api/patients", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updatePatient(userId, data) {
  return apiRequest(`/api/patients/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deletePatient(userId) {
  return apiRequest(`/api/patients/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
}