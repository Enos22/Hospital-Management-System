const API_URL = import.meta.env.VITE_API_BASE_URL;

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // Safely parse JSON in case the server returns an empty body (like a 204)
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || data.error || "Failed to process appointment request.";
    const error = new Error(message);
    error.status = response.status;
    error.details = data.errors ?? null;
    throw error;
  }

  return data;
}

export function getAppointments(page = 1) {
  return request(`/appointments?page=${page}`);
}

export function getAppointmentById(id) {
  if (!id) throw new Error("Appointment ID is required.");
  return request(`/appointments/${id}`);
}

export function createAppointment(appointmentData) {
  const { date, start_time, end_time } = appointmentData || {};
  
  if (!date || !start_time || !end_time) {
    throw new Error("Date, start time, and end time are required.");
  }

  return request("/appointments", {
    method: "POST",
    body: JSON.stringify(appointmentData),
  });
}

export function updateAppointment(id, updates) {
  if (!id) throw new Error("Appointment ID is required.");

  return request(`/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export function cancelAppointment(id) {
  return updateAppointment(id, { status: "cancelled" });
}
