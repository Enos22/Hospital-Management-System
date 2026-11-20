import { request } from "../../../lib/api/client.js";

const BASE_PATH = "/api/pharmacy/medicines";

export async function listMedicines({
  page = 1,
  perPage = 10,
  search = "",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (search.trim()) params.set("search", search.trim());
  return request(`${BASE_PATH}?${params.toString()}`);
}

export async function getMedicine(medicineId) {
  const data = await request(`${BASE_PATH}/${encodeURIComponent(medicineId)}`);
  return data?.medicine ?? data;
}

export async function createMedicine(medicine) {
  const data = await request(BASE_PATH, {
    method: "POST",
    body: JSON.stringify(medicine),
  });
  return data?.medicine ?? data;
}

export async function updateMedicine(medicineId, changes) {
  const data = await request(
    `${BASE_PATH}/${encodeURIComponent(medicineId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(changes),
    },
  );
  return data?.medicine ?? data;
}

export function deleteMedicine(medicineId) {
  return request(`${BASE_PATH}/${encodeURIComponent(medicineId)}`, {
    method: "DELETE",
  });
}
