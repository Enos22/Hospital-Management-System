import Button from "../ui/Button.jsx";

export default function ForbiddenState({
  title = "Access unavailable",
  message = "You do not have permission to view this information.",
  onGoBack,
}) {
  return (
    <section className="feedback-state forbidden-state" role="status">
      <h1>{title}</h1>
      <p>{message}</p>
      {onGoBack && (
        <Button variant="secondary" onClick={onGoBack}>
          Go back
        </Button>
      )}
    </section>
  );
}
