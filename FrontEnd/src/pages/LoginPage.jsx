import { Link, useNavigate } from "react-router-dom";
import {AuthForm} from "../features/auth/components/AuthForm.jsx";
import { useLogin } from "../features/auth/hooks/useAuth.js";
import { getLandingForRole, ROUTES } from "../app/navigation/routePaths.js";

export default function LoginPage() {
  const { execute: login, loading, error } = useLogin();
  const navigate = useNavigate();

  const submit = async ({ username, password }) => {
    const user = await login(username, password);
    if (user) {
      navigate(getLandingForRole(user.role), { replace: true });
    }
  };

  return (
    <main className="auth-page">
      <h1>Sign in</h1>
      <p className="auth-page__intro">Welcome back. Sign in to continue to AfyaCare.</p>
      <AuthForm mode="login" onSubmit={submit} loading={loading} error={error?.message} />
      <p className="auth-page__footer"><Link to={ROUTES.SIGNUP}>Create an account</Link></p>
    </main>
  );
}
