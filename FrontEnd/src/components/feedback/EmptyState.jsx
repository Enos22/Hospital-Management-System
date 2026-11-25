/*
 * TODO: Present a consistent no-results or no-data state.
 */
export default function EmptyState({
  title = "Nothing here yet",
  description,
  action,
  className = "",
}) {
  return (
    <section className={`feedback-state empty-state${className ? ` ${className}` : ""}`}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action}
    </section>
  );
}