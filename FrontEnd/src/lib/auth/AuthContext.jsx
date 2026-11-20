import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ACCESS_TOKEN_KEY, request } from "../api/client.js";

const USER_KEY = "afyacare.user";
const AuthContext = createContext(null);

function readStoredUser() {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(USER_KEY);
  if (!stored) return null;
  try {
    const user = JSON.parse(stored);
    if (!user || typeof user !== "object" || Array.isArray(user)) {
      throw new TypeError("Stored user data is invalid.");
    }
    return user;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(readStoredUser);

  function setSession(userData, accessToken) {
    if (!userData || !accessToken) {
      throw new TypeError("Both user details and an access token are required.");
    }
    const { access_token: _accessToken, ...safeUser } = userData;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
    queryClient.clear();
    setUser(safeUser);
    return safeUser;
  }

  async function signIn(credentials) {
    const result = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (!result?.access_token) {
      throw new Error("The sign-in response did not include an access token.");
    }
    const { access_token: accessToken, ...userData } = result;
    return setSession(userData, accessToken);
  }

  function signOut() {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    queryClient.clear();
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, setSession, signIn, signOut, isAuthenticated: Boolean(user) }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider.");
  return context;
}
