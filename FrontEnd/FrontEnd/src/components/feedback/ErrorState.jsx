import { getErrorMessage } from "../../lib/api/errors.js";
import Button from "../ui/Button.jsx";

export default function ErrorState({
  error,
  message,
  onRetry,
  className = "",
}) {
  return (
    <section className={`feedback-state error-state${className ? ` ${className}` : ""}`} role="alert">
      <h2>Unable to load this information</h2>
      <p>{message ?? getErrorMessage(error)}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </section>
  );
}
