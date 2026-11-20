/*
 * TODO: Render the shared header, account menu, and global actions.
 */
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../app/navigation/routePaths.js";
import { useAuth } from "../../lib/auth/AuthContext.jsx";
import Button from "../ui/Button.jsx";

export default function Topbar({ user: suppliedUser, onSignOut }) {
  const auth = useAuth();
  const user = suppliedUser ?? auth.user;

  function signOut() {
    (onSignOut ?? auth.signOut)();
  }

  return (
    <header className="topbar">
      <Link className="topbar-brand" to="/">AfyaCare</Link>
      <div className="topbar-actions">
        <Link className="topbar-notifications" to={ROUTE_PATHS.notifications}>
          Notifications
        </Link>
        <span className="topbar-user">
          {user?.username ?? user?.email ?? "Account"}
        </span>
        <Button size="small" variant="ghost" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </header>
  );
}