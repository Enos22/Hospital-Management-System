export default function Spinner({
  size = "medium",
  label = "Loading",
  className = "",
}) {
  return (
    <span
      className={`spinner spinner-${size}${className ? ` ${className}` : ""}`}
      role="status"
      aria-label={label}
    />
  );
}
