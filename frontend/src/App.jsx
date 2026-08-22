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
      <nav className="navbar">
        <span className="logo">HRMS</span>
        <div className="nav-links">
          <a href="/dashboard">Dashboard</a>
          <a href="/payroll">Payroll</a>
        </div>
      </nav>

      <div className="page-container">
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
    </BrowserRouter>
  );
}

export default App;