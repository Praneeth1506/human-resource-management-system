import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, NavLink } from "react-router-dom";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Payroll from "./pages/Payroll";
import ProfileModal from "./components/ProfileModal";
import StatusDot from "./components/StatusDot";
import Avatar from "./components/Avatar";
import "./App.css";

// Default user data for session context
const DEFAULT_USER = {
  id: 1,
  name: "Alex Morgan",
  initials: "AM",
  role: "admin", // "admin" | "employee"
  job_title: "Head of People & Operations",
  department: "People Operations",
  email: "alex.morgan@company.com",
  status: "present",
  wage: 85000,
};

function App() {
  const [currentRole, setCurrentRole] = useState("admin"); // toggleable between 'admin' and 'employee'
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCheckInToggle = () => {
    setIsCheckedIn((prev) => !prev);
  };

  const currentUser = {
    ...DEFAULT_USER,
    status: isCheckedIn ? "present" : "absent",
    role: currentRole,
  };

  return (
    <BrowserRouter>
      <div className="app-shell">
        {/* Modern Top Navigation Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <NavLink to="/dashboard" className="brand">
              <div className="brand-icon">
                <span>✦</span>
              </div>
              <div className="brand-text">
                <span className="brand-name">WorkPulse</span>
                <span className="brand-tag">HRMS</span>
              </div>
            </NavLink>

            <nav className="nav-links">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <span className="nav-icon">👥</span>
                <span>Employees</span>
              </NavLink>
              <NavLink
                to="/attendance"
                className="nav-link nav-link-dimmed"
                title="Handled by Attendance Team"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Attendance day-wise records are managed in the Attendance module.");
                }}
              >
                <span className="nav-icon">📅</span>
                <span>Attendance</span>
              </NavLink>
              <NavLink
                to="/time-off"
                className="nav-link nav-link-dimmed"
                title="Handled by Time Off Team"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Time off calendar and approvals are managed in the Time Off module.");
                }}
              >
                <span className="nav-icon">✈️</span>
                <span>Time Off</span>
              </NavLink>
              <NavLink
                to="/payroll"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <span className="nav-icon">💳</span>
                <span>Payroll</span>
              </NavLink>
            </nav>
          </div>

          <div className="topbar-right">
            {/* Search Input Bar (Image 2 theme) */}
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search employees, roles, IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Quick Check-In / Check-Out Widget */}
            <button
              className={`checkin-btn ${isCheckedIn ? "checked-in" : "checked-out"}`}
              onClick={handleCheckInToggle}
              title="Click to toggle attendance status"
            >
              <StatusDot status={isCheckedIn ? "present" : "absent"} size="sm" pulse={isCheckedIn} />
              <span>{isCheckedIn ? "Checked In" : "Check In"}</span>
            </button>

            {/* Notifications */}
            <button
              className="icon-button notification-btn"
              aria-label="Notifications"
              onClick={() => alert("Action Center: 2 items need attention today.")}
            >
              <span>🔔</span>
              <span className="notification-badge" />
            </button>

            {/* Profile Pill with Dropdown */}
            <div className="profile-menu-container">
              <button
                className="profile-pill"
                onClick={() => setShowProfileMenu((prev) => !prev)}
                aria-expanded={showProfileMenu}
              >
                <Avatar
                  initials={currentUser.initials}
                  name={currentUser.name}
                  size="sm"
                  status={currentUser.status}
                  paletteIndex={2}
                />
                <span className="profile-pill-name">{currentUser.name}</span>
                <span className="profile-pill-chevron">▾</span>
              </button>

              {showProfileMenu && (
                <div
                  className="profile-dropdown-menu"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <div className="dropdown-user-header">
                    <strong>{currentUser.name}</strong>
                    <span className="user-role-badge">
                      {currentRole === "admin" ? "HR Admin" : "Employee"}
                    </span>
                    <p className="user-email-text">{currentUser.email}</p>
                  </div>

                  <div className="dropdown-divider" />

                  <button
                    className="dropdown-item"
                    onClick={() => setIsProfileModalOpen(true)}
                  >
                    <span className="dropdown-item-icon">👤</span>
                    <span>My Profile</span>
                  </button>

                  <div className="dropdown-divider" />

                  {/* Role switcher for convenient local validation */}
                  <div className="role-switch-row">
                    <span className="role-switch-label">Viewing Mode:</span>
                    <div className="role-toggle-group">
                      <button
                        className={`role-toggle-btn ${currentRole === "admin" ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentRole("admin");
                        }}
                      >
                        Admin
                      </button>
                      <button
                        className={`role-toggle-btn ${currentRole === "employee" ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentRole("employee");
                        }}
                      >
                        Employee
                      </button>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <button
                    className="dropdown-item text-danger"
                    onClick={() => alert("Logged out successfully.")}
                  >
                    <span className="dropdown-item-icon">🚪</span>
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="page-container">
          <Routes>
            <Route
              path="/dashboard"
              element={
                currentRole === "admin" ? (
                  <AdminDashboard searchQuery={searchQuery} />
                ) : (
                  <EmployeeDashboard
                    employeeId={currentUser.id}
                    isCheckedIn={isCheckedIn}
                    onToggleCheckIn={handleCheckInToggle}
                  />
                )
              }
            />
            <Route
              path="/payroll"
              element={<Payroll employeeId={currentUser.id} />}
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {/* "My Profile" Modal (View with Profile / Private Info / Salary Info tabs) */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          employee={currentUser}
          isAdmin={currentRole === "admin"}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;