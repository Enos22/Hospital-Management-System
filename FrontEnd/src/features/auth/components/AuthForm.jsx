export function AuthForm({ onSubmit, loading }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        onSubmit?.({
          email: data.get("email"),
          password: data.get("password"),
        });
      }}
    >
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}/*
 * TODO: Build reusable sign-in/sign-up form UI without owning session state.
 */
