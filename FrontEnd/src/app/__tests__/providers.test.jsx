import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppProviders from "../providers.jsx";
import { useToast } from "../../components/feedback/ToastProvider.jsx";

function ToastProbe() {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast.success("Changes saved.")}>
      Save
    </button>
  );
}

describe("application providers", () => {
  it("makes the shared toast API available to portal descendants", async () => {
    const user = userEvent.setup();
    render(
      <AppProviders>
        <ToastProbe />
      </AppProviders>,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Changes saved.")).toBeInTheDocument();
  });
});
