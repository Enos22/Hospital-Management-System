import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "../Button.jsx";
import Dialog from "../Dialog.jsx";

describe("shared UI keyboard behavior", () => {
  it("keeps buttons keyboard-focusable and activates on Enter", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    await user.tab();
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("labels the dialog and reports keyboard cancellation", () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog
        open
        onOpenChange={onOpenChange}
        title="Edit medicine"
        description="Update inventory details."
      >
        <button type="button">Save</button>
      </Dialog>,
    );

    const dialog = screen.getByRole("dialog", { name: "Edit medicine" });
    expect(dialog).toHaveAttribute("aria-describedby");
    fireEvent(dialog, new Event("cancel", { bubbles: false, cancelable: true }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
