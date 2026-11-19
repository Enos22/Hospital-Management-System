import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { ROUTES } from "../../app/navigation/routePaths.js";

export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  return <Outlet />;
}

export function RequireRole({ allowed, children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!allowed.includes(user.role)) return <Navigate to={ROUTES.FORBIDDEN} replace />;
  return children;
}
