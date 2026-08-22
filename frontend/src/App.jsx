import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Payroll from "./pages/employee/Payroll";
import "./App.css";

const CURRENT_EMPLOYEE_ID = 1;
const CURRENT_ROLE = "employee"; // switch to "admin" to test admin view

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
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
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;