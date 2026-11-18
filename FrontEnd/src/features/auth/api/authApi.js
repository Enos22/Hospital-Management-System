import { apiRequest } from "../../../lib/api/client.js";

function adaptAuthResponse(data) {
  const {
    access_token: snakeCaseToken,
    accessToken: camelCaseToken,
    token,
    user,
    current_user: currentUser,
    ...userFields
  } = data ?? {};

  return {
    accessToken: snakeCaseToken || camelCaseToken || token,
    user: user || currentUser || userFields,
  };
}

export async function loginRequest(username, password) {
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: { username, password },
    auth: false,
  });
  return adaptAuthResponse(data);
}

export async function signupRequest({ username, email, password, role = "patient" }) {
  const data = await apiRequest("/api/auth/signup", {
    method: "POST",
    body: {
      username,
      email,
      password,
      password_confirmation: password,
      role,
    },
    auth: false,
  });
  return adaptAuthResponse(data);
}

export async function checkSessionRequest() {
  return apiRequest("/api/auth/checksession");
}

export async function logoutRequest() {
  return apiRequest("/api/auth/logout", { method: "DELETE" });
}
