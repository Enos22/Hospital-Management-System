import { useState } from "react";
import { useAuth } from "../../../lib/auth/AuthContext.jsx";

export function useLogin() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      return await login(username, password);
    } catch (requestError) {
      setError(requestError);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}

export function useSignup() {
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      return await signup(payload);
    } catch (requestError) {
      setError(requestError);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}

export function useLogout() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    setLoading(true);
    try {
      await logout();
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading };
}

export function useSession() {
  const { user, loading, isAuthenticated } = useAuth();
  return { user, loading, isAuthenticated };
}