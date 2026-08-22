import { useEffect, useState } from "react";
import api from "../services/api";

export default function EmployeeDashboard({ employeeId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/dashboard/employee/${employeeId}`).then((res) => setData(res.data));
  }, [employeeId]);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="dashboard-grid">
      <div className="card metric-card purple">
        <div className="metric-head">
          <span className="metric-title">Attendance</span>
          <span className="metric-icon">◔</span>
        </div>
        <div className="metric-value">
          <strong>{data.attendance_percent}</strong>
          <span>%</span>
        </div>
      </div>

      <div className="card metric-card green">
        <div className="metric-head">
          <span className="metric-title">Leave Balance</span>
          <span className="metric-icon">✦</span>
        </div>
        <div className="metric-value">
          <strong>{data.leave_balance}</strong>
          <span>days</span>
        </div>
      </div>

      <div className="card metric-card pink">
        <div className="metric-head">
          <span className="metric-title">Salary</span>
          <span className="metric-icon">₹</span>
        </div>
        <div className="metric-value">
          <strong>{data.latest_net_pay ?? "—"}</strong>
        </div>
      </div>
    </div>
  );
}