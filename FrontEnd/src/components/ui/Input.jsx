import { useId } from "react";

export default function Input({
  id,
  label,
  error,
  hint,
  as = "input",
  className = "",
  ...props
}) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const messageId = `${controlId}-message`;
  const Control = as;
  const describedBy =
    [props["aria-describedby"], error || hint ? messageId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="field">
      {label && <label className="field-label" htmlFor={controlId}>{label}</label>}
      <Control
        {...props}
        id={controlId}
        className={`field-control${error ? " field-control-error" : ""}${className ? ` ${className}` : ""}`}
        aria-invalid={error ? "true" : props["aria-invalid"]}
        aria-describedby={describedBy}
      />
      {(error || hint) && (
        <span
          className={error ? "field-message field-message-error" : "field-message"}
          id={messageId}
        >
          {error ?? hint}
        </span>
      )}
    </div>
  );
}
