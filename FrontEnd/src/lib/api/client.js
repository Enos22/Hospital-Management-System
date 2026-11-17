/*
 * TODO: Implement shared HTTP transport, JSON parsing, Bearer auth, and failures.
 */
import { TOKEN_KEY, USER_KEY } from "../constants.js";
import { normalizeError } from "./errors.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5555";


export function getToken() {

 return localStorage.getItem(TOKEN_KEY);
}

export function clearSessionStorage(){
 localStorage.removeItem(TOKEN_KEY);
 localStorage.removeItem(USER_KEY);

}
export async function apiRequest(path, {method = "GET", body, auth = true} = {}) {
 const headers = { "Content-Type": "application/json"};

 if (auth) {
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch (`${BASE_URL}${path}`, {
   method,
   headers,
   body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); }
  catch { data = null; }

  if(!res.ok) {
   if (res.status === 401)
    clearSessionStorage();
   throw normalizeError(data, res.status);
   
  }
  return data;
}