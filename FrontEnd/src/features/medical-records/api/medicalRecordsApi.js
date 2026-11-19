import { apiRequest } from "../../../lib/api/client";

const BASE_URL = "/api/medical-records";

// Get medical records with optional filters and pagination
export const getMedicalRecords = (params = {}) => {
  const query = new URLSearchParams(params).toString();

  return apiRequest(
    `${BASE_URL}${query ? `?${query}` : ""}`
  );
};

// Get one medical record
export const getMedicalRecord = (recordId) => {
  return apiRequest(`${BASE_URL}/${recordId}`);
};

// Create a medical record
export const createMedicalRecord = (recordData) => {
  return apiRequest(BASE_URL, {
    method: "POST",
    body: recordData,
  });
};

// Update a medical record
export const updateMedicalRecord = (recordId, recordData) => {
  return apiRequest(`${BASE_URL}/${recordId}`, {
    method: "PATCH",
    body: recordData,
  });
};

// Delete a medical record (admin only)
export const deleteMedicalRecord = (recordId) => {
  return apiRequest(`${BASE_URL}/${recordId}`, {
    method: "DELETE",
  });
};

// Get a patient's medical history
export const getPatientMedicalHistory = (patientId) => {
  return apiRequest(`/api/patients/${patientId}/medical-history`);
};