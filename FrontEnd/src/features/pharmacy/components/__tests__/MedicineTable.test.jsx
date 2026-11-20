import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MedicineTable from "../MedicineTable.jsx";
import { canManagePharmacy } from "../../permissions.js";
import { ROLES } from "../../../../lib/constants.js";

const medicines = [
  {
    id: 8,
    name: "Paracetamol",
    description: "500 mg tablets",
    price: 12.5,
    stock_quantity: 4,
    created_at: "2026-01-01T10:00:00",
  },
];

describe("MedicineTable pharmacy permissions", () => {
  it.each([
    [ROLES.ADMIN, true],
    [ROLES.DOCTOR, false],
    [ROLES.PATIENT, false],
  ])("applies the %s role's management permission", async (role, expected) => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <MedicineTable
        medicines={medicines}
        canManage={canManagePharmacy(role)}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText("Paracetamol")).toBeInTheDocument();
    if (!expected) {
      expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Delete Paracetamol" }),
      ).not.toBeInTheDocument();
      return;
    }

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("button", { name: "Delete Paracetamol" }));
    expect(onEdit).toHaveBeenCalledWith(medicines[0]);
    expect(onDelete).toHaveBeenCalledWith(medicines[0]);
    expect(screen.getByText(/Low stock/)).toBeInTheDocument();
  });
});
