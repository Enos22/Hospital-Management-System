import { apiRequest } from "../../../lib/api/client";

const BASE_URL = "/api/prescriptions";

// List prescriptions
export const getPrescriptions = (params = {}) => {
  const query = new URLSearchParams(params).toString();

  return apiRequest(
    `${BASE_URL}${query ? `?${query}` : ""}`
  );
};

// Get one prescription
export const getPrescription = (prescriptionId) => {
  return apiRequest(`${BASE_URL}/${prescriptionId}`);
};

// Create prescription
export const createPrescription = (prescriptionData) => {
  return apiRequest(BASE_URL, {
    method: "POST",
    body: prescriptionData,
  });
};

// Update prescription
export const updatePrescription = (prescriptionId, prescriptionData) => {
  return apiRequest(`${BASE_URL}/${prescriptionId}`, {
    method: "PATCH",
    body: prescriptionData,
  });
};

// Delete prescription (admin only)
export const deletePrescription = (prescriptionId) => {
  return apiRequest(`${BASE_URL}/${prescriptionId}`, {
    method: "DELETE",
  });
};