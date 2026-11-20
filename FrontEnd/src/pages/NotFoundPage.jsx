import { Link } from "react-router-dom";
import { ROUTES } from "../app/navigation/routePaths.js";

export default function NotFoundPage() {
  return (
    <main className="message-page">
      <h1>Page not found</h1>
      <Link to={ROUTES.LOGIN}>Go to sign in</Link>
    </main>
  );
}
