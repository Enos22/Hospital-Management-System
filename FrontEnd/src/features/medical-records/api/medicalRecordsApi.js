/*
 * TODO: Implement medical-record and patient-history requests and adapters.
 */
const API_URL = import.meta.env.VITE_API_BASE_URL;

async function request(endpoint, token, options = {}) {
  if (!token) throw new Error("Authentication token is required.");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data.message ||
      data.error ||
      data.msg ||
      data.errors?.[0] ||
      "Failed to process medical record request.";

    const error = new Error(message);
    error.status = response.status;
    error.details = data.errors ?? null;
    throw error;
  }

  return data;
}

export function getMedicalRecords(token, page = 1, perPage = 10, { patientId, search } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  if (patientId) params.set("patient_id", patientId);
  if (search) params.set("search", search);

  return request(`/medical-records?${params}`, token);
}

export function getMedicalRecordById(id, token) {
  if (!id) throw new Error("Medical record ID is required.");
  return request(`/medical-records/${id}`, token);
}

export function getPatientMedicalHistory(patientId, token) {
  if (!patientId) throw new Error("Patient profile ID is required.");
  return request(`/patients/${patientId}/medical-history`, token);
}

export function createMedicalRecord(recordData, token) {
  const { patient_id, diagnosis, treatment } = recordData || {};

  if (!patient_id || !diagnosis || !treatment) {
    throw new Error("Patient, diagnosis, and treatment are required.");
  }

  return request("/medical-records", token, {
    method: "POST",
    body: JSON.stringify(recordData),
  });
}

export function updateMedicalRecord(id, updates, token) {
  if (!id) throw new Error("Medical record ID is required.");

  return request(`/medical-records/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export function deleteMedicalRecord(id, token) {
  if (!id) throw new Error("Medical record ID is required.");

  return request(`/medical-records/${id}`, token, {
    method: "DELETE",
  });
}