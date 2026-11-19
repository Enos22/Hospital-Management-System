import { useState } from "react";

export default function AuthForm({ mode, onSubmit, loading = false, error = null }) {
  const isSignup = mode === "signup";
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    role: "patient",
  });

  const update = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSubmit(isSignup
      ? values
      : { username: values.username, password: values.password });
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <label className="auth-form__field">
        Username
        <input name="username" value={values.username} onChange={update} required autoComplete="username" />
      </label>
      {isSignup && (
          <label className="auth-form__field">
            Email
            <input name="email" type="email" value={values.email} onChange={update} required autoComplete="email" />
          </label>
      )}
      <label className="auth-form__field">
        Password
        <input
          name="password"
          type="password"
          value={values.password}
          onChange={update}
          required
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
      </label>
      {isSignup && (
          <label className="auth-form__field">
            Role
            <select name="role" value={values.role} onChange={update}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </label>
      )}
      {error && <p className="auth-form__error" role="alert">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}
