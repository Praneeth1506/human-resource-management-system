import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Payroll from "./pages/Payroll";
import "./App.css";

// Temporary hardcoded values until Person 1's auth/login is wired in
const CURRENT_EMPLOYEE_ID = 1;
const CURRENT_ROLE = "employee"; // switch to "admin" to test admin view
const CURRENT_USER_NAME = "Arun Kumar";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
        <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
        <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
        <rect x="11" y="11" width="6.5" height="6.5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    to: "/attendance",
    label: "Attendance",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 6v4.3l2.8 1.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/leave",
    label: "Leave",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.75" y="3.75" width="14.5" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M2.75 7.75h14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6.5 2.5v2.5M13.5 2.5v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/payroll",
    label: "Payroll",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="4.5" width="15" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M2.5 8.25h15" stroke="currentColor" strokeWidth="1.6" />
        <path d="M5.5 12h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/attendance": "Attendance",
  "/leave": "Leave",
  "/payroll": "Payroll",
};

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Shell({ sidebarOpen, onCloseSidebar, onToggleSidebar, children }) {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? "Dashboard";

  return (
    <div className="app-shell">
      {sidebarOpen && <div className="sidebar-backdrop" onClick={onCloseSidebar} />}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">D</span>
          <span className="brand-name">Dayflow HRMS</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <a
                key={item.to}
                href={item.to}
                className={`nav-item ${active ? "nav-item-active" : ""}`}
                onClick={onCloseSidebar}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="menu-toggle"
              aria-label="Toggle navigation"
              onClick={onToggleSidebar}
            >
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <div>
              <p className="breadcrumb">Dayflow HRMS</p>
              <h1 className="page-title">{pageTitle}</h1>
            </div>
          </div>

          <div className="topbar-right">
            <button type="button" className="icon-btn" aria-label="Search">
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
                <path d="M13.5 13.5 17.5 17.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <button type="button" className="icon-btn" aria-label="Notifications">
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5 8a5 5 0 0 1 10 0c0 3.5 1.2 4.5 1.2 4.5H3.8S5 11.5 5 8Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path d="M8.3 15.5a1.7 1.7 0 0 0 3.4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <div className="user-chip">
              <span className="avatar">{initials(CURRENT_USER_NAME)}</span>
              <span className="user-name">{CURRENT_USER_NAME}</span>
            </div>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <Shell
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
      >
        <Routes>
          <Route
            path="/dashboard"
            element={
              CURRENT_ROLE === "admin" ? (
                <AdminDashboard />
              ) : (
                <EmployeeDashboard employeeId={CURRENT_EMPLOYEE_ID} />
              )
            }
          />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/payroll" element={<Payroll employeeId={CURRENT_EMPLOYEE_ID} />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}

export default App;
