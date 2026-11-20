export function AuthForm({ mode = "login", onSubmit, loading, error }) {
  const isSignup = mode === "signup";

  return (
    <form
      className="auth-form"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        onSubmit?.({
          username: data.get("username"),
          email: data.get("email"),
          password: data.get("password"),
          role: data.get("role") || "patient",
        });
      }}
    >
      {isSignup && (
        <label className="auth-form__field">
          Username
          <input name="username" type="text" placeholder="Choose a username" required />
        </label>
      )}
      <label className="auth-form__field">
        {isSignup ? "Email" : "Username"}
        <input
          name={isSignup ? "email" : "username"}
          type={isSignup ? "email" : "text"}
          placeholder={isSignup ? "you@example.com" : "Enter your username"}
          required
        />
      </label>
      {isSignup && (
        <label className="auth-form__field">
          Account type
          <select name="role" defaultValue="patient">
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
        </label>
      )}
      <label className="auth-form__field">
        Password
        <input name="password" type="password" placeholder="Enter your password" required />
      </label>
      {error && <p className="auth-form__error" role="alert">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? (isSignup ? "Creating account..." : "Signing in...") : (isSignup ? "Create account" : "Sign in")}
      </button>
    </form>
  );
}
