import { apiRequest } from "../../../lib/api/client";

const BASE_URL = "/api/laboratory/tests";

// Get all laboratory tests
export const getLaboratoryTests = (params = {}) => {
  const query = new URLSearchParams(params).toString();

  return apiRequest(`${BASE_URL}${query ? `?${query}` : ""}`);
};

// Get one laboratory test
export const getLaboratoryTest = (testId) => {
  return apiRequest(`${BASE_URL}/${testId}`);
};

// Create a laboratory test
export const createLaboratoryTest = (testData) => {
  return apiRequest(BASE_URL, {
    method: "POST",
    body: testData,
  });
};

// Update a laboratory test
export const updateLaboratoryTest = (testId, testData) => {
  return apiRequest(`${BASE_URL}/${testId}`, {
    method: "PATCH",
    body: testData,
  });
};