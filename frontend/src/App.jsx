import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Authentication
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";

// Employee Pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import Attendance from "./pages/employee/Attendance";
import Profile from "./pages/employee/Profile";
import EditProfile from "./pages/employee/EditProfile";

// Leave
import Leave from "./pages/leave/Leave";

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />

        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Employee Dashboard */}
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute role="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

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

        {/* Unknown Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;