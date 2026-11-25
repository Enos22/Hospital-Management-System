
import { apiRequest } from "../../../lib/api/client";

export function listAppointments(params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
    ),
  ).toString();
  return apiRequest(`/api/appointments${query ? `?${query}` : ""}`);
}

export function getAppointment(appointmentId) {
  return apiRequest(`/api/appointments/${encodeURIComponent(appointmentId)}`);
}

export function createAppointment(payload) {
  return apiRequest("/api/appointments", { method: "POST", body: payload });
}

export function updateAppointment(appointmentId, payload) {
  return apiRequest(`/api/appointments/${encodeURIComponent(appointmentId)}`, {
    method: "PUT",
    body: payload,
  });
}

export function cancelAppointment(appointmentId) {
  return apiRequest(`/api/appointments/${encodeURIComponent(appointmentId)}/cancel`, {
    method: "PATCH",
  });
}
