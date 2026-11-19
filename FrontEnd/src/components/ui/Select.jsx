import { useId } from "react";

export default function Select({
  id,
  label,
  error,
  hint,
  options = [],
  placeholder,
  children,
  className = "",
  ...props
}) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const messageId = `${controlId}-message`;
  const describedBy =
    [props["aria-describedby"], error || hint ? messageId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="field">
      {label && <label className="field-label" htmlFor={controlId}>{label}</label>}
      <select
        {...props}
        id={controlId}
        className={`field-control${error ? " field-control-error" : ""}${className ? ` ${className}` : ""}`}
        aria-invalid={error ? "true" : props["aria-invalid"]}
        aria-describedby={describedBy}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children ??
          options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
      </select>
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
