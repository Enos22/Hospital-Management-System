import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import AppProviders from "./app/providers.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);
