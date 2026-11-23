import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLandingForRole } from "../app/navigation/routePaths.js";
import { useAuth } from "../lib/auth/AuthContext.jsx";

export default function ChangePasswordPage() {
  const { user, changePassword } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const currentPassword = form.get("current_password");
    const newPassword = form.get("new_password");
    const confirmation = form.get("password_confirmation");

    if (newPassword !== confirmation) {
      setError("New passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const updatedUser = await changePassword(currentPassword, newPassword);
      navigate(getLandingForRole(updatedUser.role), { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Could not change your password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <h1>Change your password</h1>
      <p className="auth-page__intro">
        {user?.must_change_password
          ? "For your security, set a new password before continuing to the doctor portal."
          : "Update your account password."}
      </p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-form__field">
          Current password
          <input
            name="current_password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        <label className="auth-form__field">
          New password
          <input
            name="new_password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <label className="auth-form__field">
          Confirm new password
          <input
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        {error && <p className="auth-form__error" role="alert">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Updating password..." : "Update password"}
        </button>
      </form>
    </main>
  );
}
