
import { useState } from "react";

export function AuthForm({ mode = "login", onSubmit, loading, error }) {
  const isSignup = mode === "signup";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const validateForm = (data) => {
    if (isSignup) {
      const username = data.username;
      const name = data.name;
      const email = data.email;
      const age = Number(data.age);
      const phone = data.phone_number;
      const address = data.address;
      const password = data.password;
      const confirmation = data.password_confirmation;

      if (!/^[a-zA-Z0-9_.]{3,30}$/.test(username)) {
        return "Username must be 3–30 characters and contain only letters, numbers, dots or underscores.";
      }

      if (name.length < 3 || name.length > 100) {
        return "Full name must be between 3 and 100 characters.";
      }

      if (!/^[\p{L}\s'-]+$/u.test(name)) {
        return "Full name contains invalid characters.";
      }

      if (!Number.isInteger(age) || age < 1 || age > 120) {
        return "Enter a valid age between 1 and 120.";
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return "Enter a valid email address.";
      }

      if (!["Male", "Female"].includes(data.gender)) {
        return "Please select a valid gender.";
      }

      if (phone && !/^\+?[0-9\s()-]{7,20}$/.test(phone)) {
        return "Enter a valid phone number.";
      }

      if (address.length > 200) {
        return "Address cannot exceed 200 characters.";
      }

      if (password.length < 8) {
        return "Password must contain at least 8 characters.";
      }

      if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter.";
      }

      if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter.";
      }

      if (!/[0-9]/.test(password)) {
        return "Password must contain at least one number.";
      }

      if (!/[^A-Za-z0-9]/.test(password)) {
        return "Password must contain at least one special character.";
      }

      if (password !== confirmation) {
        return "Passwords do not match.";
      }
    } else {
      if (!data.username) {
        return "Username is required.";
      }

      if (data.username.length > 30) {
        return "Username cannot exceed 30 characters.";
      }

      if (!data.password) {
        return "Password is required.";
      }
    }

    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (loading) return;

    setValidationError("");

    const data = new FormData(e.currentTarget);

    const formData = {
      username: data.get("username")?.trim() || "",
      email: data.get("email")?.trim() || "",
      password: data.get("password") || "",
      password_confirmation:
        data.get("password_confirmation") || "",
      role: "patient",

      ...(isSignup && {
        name: data.get("name")?.trim() || "",
        age: Number(data.get("age")),
        gender: data.get("gender"),
        phone_number: data.get("phone_number")?.trim() || "",
        address: data.get("address")?.trim() || "",
      }),
    };

    const validation = validateForm(formData);

    if (validation) {
      setValidationError(validation);
      return;
    }

    onSubmit?.(formData);
  };

  const serverError =
    typeof error === "string"
      ? error
      : error?.message || "";

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {isSignup && (
        <>
          <label className="auth-form__field">
            Username
            <input
              name="username"
              type="text"
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_.]+"
              autoComplete="username"
              placeholder="Choose a username"
              required
            />
          </label>

          <label className="auth-form__field">
            Full name
            <input
              name="name"
              type="text"
              minLength={3}
              maxLength={100}
              autoComplete="name"
              placeholder="Enter your full name"
              required
            />
          </label>

          <label className="auth-form__field">
            Age
            <input
              name="age"
              type="number"
              min="1"
              max="120"
              step="1"
              placeholder="Enter your age"
              required
            />
          </label>

          <label className="auth-form__field">
            Gender
            <select name="gender" required defaultValue="">
              <option value="" disabled>
                Select gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>

          <label className="auth-form__field">
            Phone number
            <input
              name="phone_number"
              type="tel"
              maxLength={20}
              autoComplete="tel"
              placeholder="+254 712 345 678"
            />
          </label>

          <label className="auth-form__field">
            Address
            <textarea
              name="address"
              maxLength={200}
              autoComplete="street-address"
              placeholder="Enter your address"
            />
          </label>
        </>
      )}

      <label className="auth-form__field">
        {isSignup ? "Email" : "Username"}

        <input
          name={isSignup ? "email" : "username"}
          type={isSignup ? "email" : "text"}
          autoComplete={isSignup ? "email" : "username"}
          placeholder={
            isSignup
              ? "you@example.com"
              : "Enter your username"
          }
          required
        />
      </label>

      {isSignup && (
        <>
          <input
            type="hidden"
            name="role"
            value="patient"
          />

          <p className="auth-form__hint">
            Doctor accounts are created by a hospital administrator.
          </p>
        </>
      )}

      <label className="auth-form__field">
        Password

        <div className="auth-form__password">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            minLength={isSignup ? 8 : undefined}
            autoComplete={
              isSignup ? "new-password" : "current-password"
            }
            placeholder="Enter your password"
            required
          />

          <button
            type="button"
            className="auth-form__toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={
              showPassword ? "Hide password" : "Show password"
            }
            aria-pressed={showPassword}
            title={showPassword ? "Hide password" : "Show password"}
          >
            <i
              className={`fa-solid ${
                showPassword ? "fa-eye-slash" : "fa-eye"
              }`}
              aria-hidden="true"
            />
          </button>
        </div>
      </label>

      {isSignup && (
        <label className="auth-form__field">
          Confirm password

          <div className="auth-form__password">
            <input
              name="password_confirmation"
              type={
                showConfirmPassword ? "text" : "password"
              }
              minLength={8}
              autoComplete="new-password"
              placeholder="Confirm your password"
              required
            />

            <button
              type="button"
              className="auth-form__toggle"
              onClick={() =>
                setShowConfirmPassword((prev) => !prev)
              }
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
              aria-pressed={showConfirmPassword}
              title={
                showConfirmPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              <i
                className={`fa-solid ${
                  showConfirmPassword
                    ? "fa-eye-slash"
                    : "fa-eye"
                }`}
                aria-hidden="true"
              />
            </button>
          </div>
        </label>
      )}

      {(validationError || serverError) && (
        <p className="auth-form__error" role="alert">
          {validationError || serverError}
        </p>
      )}

      <button type="submit" disabled={loading}>
        {loading
          ? isSignup
            ? "Creating account..."
            : "Signing in..."
          : isSignup
            ? "Create account"
            : "Sign in"}
      </button>
    </form>
  );
}
