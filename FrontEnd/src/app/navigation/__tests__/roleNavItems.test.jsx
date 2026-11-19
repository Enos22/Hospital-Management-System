import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { roleNavItems } from "../roleNavItems.js";
import { ROLES } from "../../../lib/constants.js";
import Sidebar from "../../../components/layout/Sidebar.jsx";
import MobileNavigation from "../../../components/layout/MobileNavigation.jsx";

const expectedLabels = {
  [ROLES.ADMIN]: [
    "Dashboard", "Patients", "Doctors", "Appointments", "Pharmacy",
    "Billing", "Reports", "Users", "Notifications",
  ],
  [ROLES.DOCTOR]: [
    "Patients", "Appointments", "Pharmacy", "Laboratory",
    "Medical records", "Prescriptions", "Notifications",
  ],
  [ROLES.PATIENT]: [
    "Home", "Appointments", "Laboratory", "Medical history",
    "Prescriptions", "Bills", "Notifications",
  ],
};

describe("role navigation", () => {
  it.each(Object.values(ROLES))("renders only the %s menu", (role) => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar role={role} />
        <MobileNavigation role={role} />
      </MemoryRouter>,
    );

    const navs = screen.getAllByRole("navigation");
    for (const nav of navs) {
      expect(
        within(nav).getAllByRole("link").map((link) => link.textContent),
      ).toEqual(expectedLabels[role]);
    }

    const allowedPaths = roleNavItems[role].map((item) => item.to);
    expect(allowedPaths).not.toContain(
      role === ROLES.PATIENT ? "/admin/pharmacy" : "/patient/bills",
    );
  });

  it("marks the current route active in desktop and mobile navigation", () => {
    render(
      <MemoryRouter initialEntries={["/doctor/pharmacy"]}>
        <Sidebar role={ROLES.DOCTOR} />
        <MobileNavigation role={ROLES.DOCTOR} />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole("link", { name: "Pharmacy" })).toHaveLength(2);
    for (const link of screen.getAllByRole("link", { name: "Pharmacy" })) {
      expect(link).toHaveAttribute("aria-current", "page");
    }
  });

  it("supports keyboard focus and activation for navigation links", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar role={ROLES.DOCTOR} />
      </MemoryRouter>,
    );

    await user.tab();
    expect(screen.getByRole("link", { name: "AfyaCare home" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Patients" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("link", { name: "Patients" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
