/*
 * TODO: Present a consistent page or section loading state.
 */
import Spinner from "../ui/Spinner.jsx";

export default function LoadingState({ label = "Loading", className = "" }) {
  return (
    <div className={`feedback-state loading-state${className ? ` ${className}` : ""}`} role="status">
      <Spinner label={label} />
      <span>{label}</span>
    </div>
  );
}