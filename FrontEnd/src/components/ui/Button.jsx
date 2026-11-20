import Spinner from "./Spinner.jsx";

const variants = new Set(["primary", "secondary", "ghost", "danger"]);
const sizes = new Set(["small", "medium"]);

export default function Button({
  variant = "primary",
  size = "medium",
  type = "button",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}) {
  const safeVariant = variants.has(variant) ? variant : "primary";
  const safeSize = sizes.has(size) ? size : "medium";

  return (
    <button
      {...props}
      className={`button button-${safeVariant} button-${safeSize}${className ? ` ${className}` : ""}`}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading && <Spinner size="small" label="Working" />}
      {children}
    </button>
  );
}
