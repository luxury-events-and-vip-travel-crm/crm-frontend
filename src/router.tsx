import { useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";

import { Spinner } from "./components/Spinner";
import { useAuthStore } from "./stores/auth";
import { ActivityLogsPage } from "./pages/ActivityLogs";
import { CompaniesPage } from "./pages/Companies";
import { CompanyDetailPage } from "./pages/CompanyDetail";
import { ContactDetailPage } from "./pages/ContactDetail";
import { LoginPage } from "./pages/Login";

function Protected({ children }: { children: JSX.Element }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

function Shell({ children }: { children: JSX.Element }) {
  const isAuthed = useAuthStore((s) => Boolean(s.accessToken));
  const logout = useAuthStore((s) => s.logout);
  const [loggingOut, setLoggingOut] = useState(false);

  async function onLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div
      style={{
        fontFamily: "system-ui",
        padding: 16,
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <header
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <strong>CRM</strong>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link to="/companies">Companies</Link>
          <Link to="/activity-logs">Activity Logs</Link>
        </nav>
        <div style={{ marginLeft: "auto" }}>
          {isAuthed ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {loggingOut ? <Spinner label="Logging out..." /> : null}
              <button disabled={loggingOut} onClick={onLogout}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Shell>
            <LoginPage />
          </Shell>
        }
      />
      <Route
        path="/companies"
        element={
          <Shell>
            <Protected>
              <CompaniesPage />
            </Protected>
          </Shell>
        }
      />
      <Route
        path="/companies/:companyId"
        element={
          <Shell>
            <Protected>
              <CompanyDetailPage />
            </Protected>
          </Shell>
        }
      />
      <Route
        path="/contacts/:contactId"
        element={
          <Shell>
            <Protected>
              <ContactDetailPage />
            </Protected>
          </Shell>
        }
      />
      <Route
        path="/activity-logs"
        element={
          <Shell>
            <Protected>
              <ActivityLogsPage />
            </Protected>
          </Shell>
        }
      />
      <Route path="/" element={<Navigate to="/companies" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
