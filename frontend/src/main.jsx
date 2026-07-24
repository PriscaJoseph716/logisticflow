import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import CustomerPortalApp from "./portal/CustomerPortalApp";
import "./styles/app.css";

function isPortalMode() {
  if (typeof window === "undefined") return false;
  const { hostname, pathname } = window.location;
  return (
    hostname.startsWith("portal.") ||
    pathname.startsWith("/portal") ||
    /^\/login(\/|$)/i.test(pathname)
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isPortalMode() ? <CustomerPortalApp /> : <App />}
  </React.StrictMode>,
);
