import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import StatusDot from "../components/StatusDot";
import Avatar from "../components/Avatar";

export default function EmployeeDashboard({
  employeeId = 1,
  isCheckedIn = true,
  onToggleCheckIn,
}) {
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get(`/dashboard/employee/${employeeId}`)
      .then((res) => setData(res.data))
      .catch(() => {
        // Fallback default values
        setData({
          attendance_percent: 94,
          leave_balance: 14,
          latest_net_pay: "72,400",
          employee_name: "Arun Kumar",
          role: "Product Engineer",
          department: "Engineering & Product",
        });
      });
  }, [employeeId]);

  const dashboardData = data || {
    attendance_percent: 94,
    leave_balance: 14,
    latest_net_pay: "72,400",
    employee_name: "Arun Kumar",
    role: "Product Engineer",
    department: "Engineering & Product",
  };

  return (
    <div className="employee-dashboard-container">
      {/* 3-Column Metric Cards Matching Screenshot */}
      <section className="employee-metrics-grid">
        {/* Card 1: Attendance */}
        <div className="employee-metric-card">
          <span className="emp-metric-title">Attendance</span>
          <div className="emp-metric-value-row">
            <strong className="emp-metric-big">{dashboardData.attendance_percent ?? ""}</strong>
            <span className="emp-metric-unit">%</span>
          </div>
        </div>

        {/* Card 2: Leave Balance */}
        <div className="employee-metric-card">
          <span className="emp-metric-title">Leave Balance</span>
          <div className="emp-metric-value-row">
            <strong className="emp-metric-big">{dashboardData.leave_balance ?? ""}</strong>
            <span className="emp-metric-unit">days</span>
          </div>
        </div>

        {/* Card 3: Salary */}
        <div className="employee-metric-card">
          <span className="emp-metric-title">Salary</span>
          <div className="emp-metric-value-row">
            <span className="emp-metric-currency">₹</span>
            <strong className="emp-metric-big">{dashboardData.latest_net_pay || "—"}</strong>
          </div>
        </div>
      </section>

      {/* Employee Quick Info & Check-in Banner */}
      <section className="emp-status-banner">
        <div className="emp-banner-info">
          <Avatar
            initials="AK"
            name={dashboardData.employee_name}
            size="md"
            status={isCheckedIn ? "present" : "absent"}
          />
          <div className="emp-banner-text">
            <h3>{dashboardData.employee_name}</h3>
            <p>
              {dashboardData.role} • {dashboardData.department} • Standard Shift (09:00 AM - 06:00 PM)
            </p>
          </div>
        </div>

        <div className="emp-banner-actions">
          <StatusDot status={isCheckedIn ? "present" : "absent"} size="md" pulse={isCheckedIn} showLabel />
          <button
            className={`primary-btn ${isCheckedIn ? "btn-checked-in" : ""}`}
            onClick={onToggleCheckIn}
          >
            {isCheckedIn ? "Check Out" : "Check In"}
          </button>
          <Link to="/payroll" className="secondary-btn small-btn">
            View Payslip →
          </Link>
        </div>
      </section>
    </div>
  );
}