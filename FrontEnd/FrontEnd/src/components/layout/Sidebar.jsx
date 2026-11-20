import { NavLink } from "react-router-dom";
import { roleNavItems } from "../../app/navigation/roleNavItems.js";

export default function Sidebar({ role, items = roleNavItems[role] ?? [] }) {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <NavLink className="brand-link" to="/" aria-label="AfyaCare home">
        <span className="brand-mark" aria-hidden="true">A</span>
        <span>AfyaCare</span>
      </NavLink>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
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
