import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import StatusDot from "../../components/StatusDot";
import Avatar from "../../components/Avatar";

export default function EmployeeDashboard({ isCheckedIn = true, onToggleCheckIn }) {
  const [data, setData] = useState(null);
  const employeeId = localStorage.getItem("employeeId");

  useEffect(() => {
    if (!employeeId) return;
    api
      .get(`/dashboard/employee/${employeeId}`)
      .then((res) => setData(res.data))
      .catch(() => setData(null));
  }, [employeeId]);

  if (!data) return <p>Loading dashboard...</p>;

  return (
    <div className="employee-dashboard-container">
      <section className="employee-metrics-grid">
        <div className="employee-metric-card">
          <span className="emp-metric-title">Attendance</span>
          <div className="emp-metric-value-row">
            <strong className="emp-metric-big">{data.attendance_percent}</strong>
            <span className="emp-metric-unit">%</span>
          </div>
        </div>
        <div className="employee-metric-card">
          <span className="emp-metric-title">Leave Balance</span>
          <div className="emp-metric-value-row">
            <strong className="emp-metric-big">{data.leave_balance}</strong>
            <span className="emp-metric-unit">days</span>
          </div>
        </div>
        <div className="employee-metric-card">
          <span className="emp-metric-title">Salary</span>
          <div className="emp-metric-value-row">
            <span className="emp-metric-currency">₹</span>
            <strong className="emp-metric-big">{data.latest_net_pay ?? "—"}</strong>
          </div>
        </div>
      </section>

      <section className="emp-status-banner">
        <div className="emp-banner-info">
          <Avatar
            initials={data.employee?.first_name?.[0] ?? "?"}
            name={`${data.employee?.first_name ?? ""} ${data.employee?.last_name ?? ""}`}
            size="md"
            status={isCheckedIn ? "present" : "absent"}
          />
          <div className="emp-banner-text">
            <h3>{data.employee?.first_name} {data.employee?.last_name}</h3>
            <p>{data.employee?.designation} • {data.employee?.department}</p>
          </div>
        </div>

        <div className="emp-banner-actions">
          <StatusDot status={isCheckedIn ? "present" : "absent"} size="md" pulse={isCheckedIn} showLabel />
          <button className={`primary-btn ${isCheckedIn ? "btn-checked-in" : ""}`} onClick={onToggleCheckIn}>
            {isCheckedIn ? "Check Out" : "Check In"}
          </button>
          <Link to="/payroll" className="secondary-btn small-btn">View Payslip →</Link>
        </div>
      </section>
    </div>
  );
}