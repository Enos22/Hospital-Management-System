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
          password_confirmation: data.get("password_confirmation"),
          role: data.get("role") || "patient",
          ...(isSignup && {
            name: data.get("name"),
            age: Number(data.get("age")),
            gender: data.get("gender"),
          }),
        });
      }}
    >
      {isSignup && (
        <>
          <label className="auth-form__field">
            Username
            <input name="username" type="text" placeholder="Choose a username" required />
          </label>

          <label className="auth-form__field">
            Full name
            <input name="name" type="text" placeholder="Enter your full name" required />
          </label>

          <label className="auth-form__field">
            Age
            <input name="age" type="number" min="1" placeholder="Enter your age" required />
          </label>

          <label className="auth-form__field">
            Gender
            <select name="gender" required defaultValue="">
              <option value="" disabled>Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>
        </>
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
        <>
          <input type="hidden" name="role" value="patient" />
          <p className="auth-form__hint">
            Doctor accounts are created by a hospital administrator.
          </p>
        </>
      )}

      <label className="auth-form__field">
        Password
        <input name="password" type="password" placeholder="Enter your password" required />
      </label>

      {isSignup && (
        <label className="auth-form__field">
          Confirm password
          <input name="password_confirmation" type="password" placeholder="Confirm your password" required />
        </label>
      )}

      {error && <p className="auth-form__error" role="alert">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading
          ? isSignup ? "Creating account..." : "Signing in..."
          : isSignup ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}