import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Authentication
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";

// Employee Pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import Attendance from "./pages/employee/Attendance";
import Profile from "./pages/employee/Profile";
import EditProfile from "./pages/employee/EditProfile";
import EmployeePayroll from "./pages/employee/Payroll";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeManagement from "./pages/admin/EmployeeManagement";
import LeaveApproval from "./pages/admin/LeaveApproval";
import AttendanceOverview from "./pages/admin/AttendanceOverview";

// Leave
import Leave from "./pages/leave/Leave";

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute role="admin">
              <EmployeeManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/leave"
          element={
            <ProtectedRoute role="admin">
              <LeaveApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute role="admin">
              <AttendanceOverview />
            </ProtectedRoute>
          }
        />

        {/* Employee Dashboard */}
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute role="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        {/* Dashboard shortcut redirect */}
        <Route path="/dashboard" element={<Navigate to="/employee/dashboard" replace />} />

        {/* Attendance */}
        <Route
          path="/attendance"
          element={
            <ProtectedRoute role="employee">
              <Attendance />
            </ProtectedRoute>
          }
        />

        {/* Leave */}
        <Route
          path="/leave"
          element={
            <ProtectedRoute role="employee">
              <Leave />
            </ProtectedRoute>
          }
        />

        {/* Payroll */}
        <Route
          path="/payroll"
          element={
            <ProtectedRoute role="employee">
              <EmployeePayroll />
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute role="employee">
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Edit Profile */}
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute role="employee">
              <EditProfile />
            </ProtectedRoute>
          }
        />

        {/* Unknown Route fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;