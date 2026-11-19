import { Link, useNavigate } from "react-router-dom";
import AuthForm from "../features/auth/components/AuthForm.jsx";
import { useSignup } from "../features/auth/hooks/useAuth.js";
import { getLandingForRole, ROUTES } from "../app/navigation/routePaths.js";

export default function SignupPage() {
  const { execute: signup, loading, error } = useSignup();
  const navigate = useNavigate();

  const submit = async (payload) => {
    const user = await signup(payload);
    if (user) {
      navigate(getLandingForRole(user.role), { replace: true });
    }
  };

  return (
    <main className="auth-page">
      <h1>Create account</h1>
      <p className="auth-page__intro">Create an AfyaCare account to get started.</p>
      <AuthForm mode="signup" onSubmit={submit} loading={loading} error={error?.message} />
      <p className="auth-page__footer"><Link to={ROUTES.LOGIN}>Already have an account?</Link></p>
    </main>
  );
}
