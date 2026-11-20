export default function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className = "",
}) {
  return (
    <header className={`page-header${className ? ` ${className}` : ""}`}>
      <div>
        {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  );
}
