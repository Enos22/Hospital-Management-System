/*
 * TODO: Build a compact loading indicator for inline and button states.
 */
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