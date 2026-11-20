/*
 * TODO: Render desktop navigation from roleNavItems and mark the active route.
 */
import { NavLink } from "react-router-dom";
import { ROLE_NAV_ITEMS } from "../../app/navigation/roleNavItems.js";

export default function Sidebar({ role, items = ROLE_NAV_ITEMS[role] ?? [] }) {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <NavLink className="brand-link" to="/" aria-label="AfyaCare home">
        <span className="brand-mark" aria-hidden="true">A</span>
        <span>AfyaCare</span>
      </NavLink>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link${isActive ? " nav-link-active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}