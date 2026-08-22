import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Payroll from "./pages/Payroll";
import "./App.css";

// Temporary hardcoded values until Person 1's auth/login is wired in
const CURRENT_EMPLOYEE_ID = 1;
const CURRENT_ROLE = "employee"; // switch to "admin" to test admin view

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <nav className="topbar">
          <div className="brand">
            <span className="brand-mark">H</span>
            <span>HRMS</span>
          </div>

          <div className="nav-links">
            <a href="/dashboard" className="nav-link active">
              Employees
            </a>
            <a href="/dashboard" className="nav-link">
              Attendance
            </a>
            <a href="/dashboard" className="nav-link">
              Time Off
            </a>
          </div>

          <div className="user-menu">
            <button className="icon-button" aria-label="Notifications">
              🔔
            </button>
            <div className="profile-pill">
              <span className="profile-avatar">AL</span>
              <span>Alex</span>
            </div>
          </div>
        </nav>

        <div className="page-container">
          <header className="page-header">
            <div>
              <p className="page-eyebrow">Overview</p>
              <h1 className="page-title">People Operations</h1>
            </div>
            <div className="header-actions">
              <button className="secondary-btn">Export</button>
              <button className="primary-btn">Check In</button>
            </div>
          </header>

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
            <Route path="/payroll" element={<Payroll employeeId={CURRENT_EMPLOYEE_ID} />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;