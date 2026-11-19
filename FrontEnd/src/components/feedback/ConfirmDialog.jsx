import { useEffect, useState } from "react";
import Button from "../ui/Button.jsx";
import Dialog from "../ui/Dialog.jsx";

export default function ConfirmDialog({
  open,
  onOpenChange,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  isConfirming = false,
  variant = "danger",
}) {
  const [confirmationError, setConfirmationError] = useState("");

  useEffect(() => {
    if (open) setConfirmationError("");
  }, [open]);

  async function confirm() {
    setConfirmationError("");
    try {
      await onConfirm?.();
      onOpenChange?.(false);
    } catch (error) {
      setConfirmationError(
        error instanceof Error ? error.message : "The action could not be completed.",
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
    >
      {confirmationError && (
        <p className="form-error" role="alert">
          {confirmationError}
        </p>
      )}
      <div className="form-actions">
        <Button
          variant="secondary"
          onClick={() => onOpenChange?.(false)}
          disabled={isConfirming}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={variant}
          onClick={confirm}
          loading={isConfirming}
          disabled={!onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
