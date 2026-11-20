import { Outlet } from "react-router-dom";
import { useAuth } from "../../lib/auth/AuthContext.jsx";
import MobileNavigation from "./MobileNavigation.jsx";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function PortalLayout({ children }) {
  const { user } = useAuth();
  const content = children ?? <Outlet />;

  return (
    <div className="portal-shell">
      <Sidebar role={user?.role} />
      <div className="portal-main">
        <Topbar user={user} />
        <main className="portal-content">{content}</main>
        <MobileNavigation role={user?.role} />
      </div>
    </div>
  );
}
