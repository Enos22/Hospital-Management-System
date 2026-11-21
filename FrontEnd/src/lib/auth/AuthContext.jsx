import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  loginRequest,
  logoutRequest,
  signupRequest,
} from "../../features/auth/api/authApi.js";
import { TOKEN_KEY, USER_KEY } from "../constants.js";
import {
  clearSessionStorage,
  SESSION_EXPIRED_EVENT,
} from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSessionExpired = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token");
    const savedUser = localStorage.getItem(USER_KEY) || localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        const savedUserData = JSON.parse(savedUser);
        localStorage.setItem(TOKEN_KEY, savedToken);
        localStorage.setItem(USER_KEY, JSON.stringify(savedUserData));
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(savedToken);
        setUser(savedUserData);
      } catch (error) {
        clearSessionStorage();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        console.error("Could not restore the saved user session.", error);
      }
    } else {
      clearSessionStorage();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    setLoading(false);
  }, []);

  const saveSession = useCallback(({ accessToken, user: authenticatedUser }) => {
    if (!accessToken) {
      throw new Error("The server did not return an access token");
    }
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
    setToken(accessToken);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const login = useCallback(async (username, password) => {
    const session = await loginRequest(username, password);
    return saveSession(session);
  }, [saveSession]);

  const signup = useCallback(async (payload) => {
    const session = await signupRequest(payload);
    return saveSession(session);
  }, [saveSession]);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearSessionStorage();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      signup,
      logout,
    }),
    [user, token, loading, login, signup, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}