/*
 * TODO: Render responsive role-based navigation for small screens.
 */
import { NavLink } from "react-router-dom";
import { ROLE_NAV_ITEMS } from "../../app/navigation/roleNavItems.js";

export default function MobileNavigation({ role, items = ROLE_NAV_ITEMS[role] ?? [] }) {
  return (
    <nav className="mobile-navigation" aria-label="Mobile navigation">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `mobile-nav-link${isActive ? " mobile-nav-link-active" : ""}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}