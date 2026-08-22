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
        // High quality fallback data if API is offline
        setData({
          attendance_percent: 94,
          leave_balance: 14,
          latest_net_pay: "₹72,400",
          employee_name: "Alex Morgan",
          role: "Frontend Specialist",
          department: "Engineering",
          present_days: 21,
          total_working_days: 22,
          pending_leave_requests: 1,
        });
      });
  }, [employeeId]);

  const dashboardData = data || {
    attendance_percent: 94,
    leave_balance: 14,
    latest_net_pay: "₹72,400",
    employee_name: "Alex Morgan",
    role: "Frontend Specialist",
    department: "Engineering",
    present_days: 21,
    total_working_days: 22,
    pending_leave_requests: 1,
  };

  return (
    <div className="employee-dashboard-container">
      {/* Welcome Banner */}
      <div className="employee-hero-banner">
        <div className="hero-left">
          <Avatar
            initials="AM"
            name={dashboardData.employee_name}
            size="lg"
            status={isCheckedIn ? "present" : "absent"}
            paletteIndex={0}
          />
          <div>
            <div className="hero-greeting">Welcome back, {dashboardData.employee_name} 👋</div>
            <p className="hero-subtext">
              {dashboardData.role} • {dashboardData.department} • Standard Shift (09:00 AM - 06:00 PM)
            </p>
          </div>
        </div>

        <div className="hero-right">
          <div className="shift-status-box">
            <span className="shift-status-label">Today&apos;s Attendance</span>
            <div className="shift-status-val">
              <StatusDot status={isCheckedIn ? "present" : "absent"} size="md" pulse={isCheckedIn} showLabel />
            </div>
          </div>
          <button
            className={`primary-btn check-in-action-btn ${isCheckedIn ? "btn-checked-in" : ""}`}
            onClick={onToggleCheckIn}
          >
            {isCheckedIn ? "Check Out for the Day" : "Check In Now"}
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <section className="dashboard-grid">
        {/* Metric 1: Attendance Percentage */}
        <div className="metric-card purple">
          <div className="metric-head">
            <span className="metric-title">Monthly Attendance</span>
            <div className="metric-icon-box purple">
              <span>◔</span>
            </div>
          </div>
          <div className="metric-body">
            <div className="metric-value">
              <strong>{dashboardData.attendance_percent}</strong>
              <span className="metric-unit">%</span>
            </div>
            <div className="metric-progress-bar-wrap">
              <div
                className="metric-progress-bar-fill purple"
                style={{ width: `${dashboardData.attendance_percent}%` }}
              />
            </div>
            <div className="metric-footer-badge purple">
              <span>{dashboardData.present_days || 21} of {dashboardData.total_working_days || 22} days logged</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Leave Balance */}
        <div className="metric-card green">
          <div className="metric-head">
            <span className="metric-title">Leave Balance</span>
            <div className="metric-icon-box green">
              <span>✦</span>
            </div>
          </div>
          <div className="metric-body">
            <div className="metric-value">
              <strong>{dashboardData.leave_balance}</strong>
              <span className="metric-unit">Days Left</span>
            </div>
            <div className="metric-progress-bar-wrap">
              <div
                className="metric-progress-bar-fill green"
                style={{ width: `${Math.min(100, (dashboardData.leave_balance / 20) * 100)}%` }}
              />
            </div>
            <div className="metric-footer-badge green">
              <span>{dashboardData.pending_leave_requests || 0} request pending review</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Latest Net Pay */}
        <div className="metric-card pink">
          <div className="metric-head">
            <span className="metric-title">Latest Net Pay</span>
            <div className="metric-icon-box pink">
              <span>₹</span>
            </div>
          </div>
          <div className="metric-body">
            <div className="metric-value">
              <strong>{dashboardData.latest_net_pay}</strong>
            </div>
            <div className="metric-footer-badge pink">
              <span>Paid on 1st of this month</span>
            </div>
          </div>
        </div>
      </section>

      {/* Employee Quick Access Section */}
      <div className="employee-info-cards-row">
        {/* Quick Link Card 1: View Detailed Payslip */}
        <div className="saas-card employee-action-card">
          <div className="action-card-icon-box pink">
            <span>📄</span>
          </div>
          <div className="action-card-text">
            <h3>Salary & Payslip Overview</h3>
            <p>
              View your monthly gross wage, attendance-based payable days, deductions, and downloadable payslip breakdown.
            </p>
            <Link to="/payroll" className="secondary-btn small-btn mt-2">
              Open Salary Info →
            </Link>
          </div>
        </div>

        {/* Quick Link Card 2: Attendance Notice & Policy */}
        <div className="saas-card employee-action-card">
          <div className="action-card-icon-box blue">
            <span>ℹ️</span>
          </div>
          <div className="action-card-text">
            <h3>Payroll & Attendance Policy</h3>
            <p>
              Your salary is directly computed from your verified daily check-in attendance records. Unexcused absences automatically deduct from total payable days.
            </p>
            <div className="policy-badge-row">
              <span className="policy-pill">✓ Standard Biometric/Web Check-in</span>
              <span className="policy-pill">✓ Auto-calculated Payable Days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}