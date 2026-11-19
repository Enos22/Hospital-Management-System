import { Link } from "react-router-dom";
import { ROUTES } from "../app/navigation/routePaths.js";

export default function ForbiddenPage() {
  return (
    <main className="message-page">
      <h1>Access denied</h1>
      <p>Your account does not have permission to view this page.</p>
      <Link to={ROUTES.LOGIN}>Return to sign in</Link>
    </main>
  );
}
