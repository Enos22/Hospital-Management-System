/*
 * TODO: Build a generic dialog shell with keyboard and focus management.
 */
import { useEffect, useId, useRef } from "react";

export default function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className = "",
}) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className={`dialog${className ? ` ${className}` : ""}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange?.(false);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onOpenChange?.(false);
      }}
    >
      <div className="dialog-content">
        <header className="dialog-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p id={descriptionId}>{description}</p>}
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Close dialog"
            onClick={() => onOpenChange?.(false)}
          >
            ×
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}