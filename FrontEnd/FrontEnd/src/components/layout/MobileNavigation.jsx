import { NavLink } from "react-router-dom";
import { roleNavItems } from "../../app/navigation/roleNavItems.js";

export default function MobileNavigation({ role, items = roleNavItems[role] ?? [] }) {
  return (
    <nav className="mobile-navigation" aria-label="Mobile navigation">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
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
