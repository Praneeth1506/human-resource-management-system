import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard/admin").then((res) => setData(res.data));
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <div className="dashboard-grid">
        <div className="card metric-card purple">
          <div className="metric-head">
            <span className="metric-title">Employees</span>
            <span className="metric-icon">👥</span>
          </div>
          <div className="metric-value">
            <strong>{data.total_employees}</strong>
          </div>
        </div>

        <div className="card metric-card green">
          <div className="metric-head">
            <span className="metric-title">Present Today</span>
            <span className="metric-icon">✓</span>
          </div>
          <div className="metric-value">
            <strong>{data.present_today}</strong>
          </div>
        </div>

        <div className="card metric-card yellow">
          <div className="metric-head">
            <span className="metric-title">Absent Today</span>
            <span className="metric-icon">⏳</span>
          </div>
          <div className="metric-value">
            <strong>{data.absent_today}</strong>
          </div>
        </div>

        <div className="card metric-card pink">
          <div className="metric-head">
            <span className="metric-title">Pending Leave</span>
            <span className="metric-icon">☕</span>
          </div>
          <div className="metric-value">
            <strong>{data.pending_leaves}</strong>
          </div>
        </div>
      </div>

      <div className="action-center">
        <div className="card-header-row">
          <h3>Needs Attention</h3>
          <span className="status-dot present" title="Live status" />
        </div>

        {data.needs_attention.low_attendance_employees.length === 0 &&
          data.needs_attention.pending_leave_count === 0 && <p>All clear ✅</p>}

        <div className="action-list">
          {data.needs_attention.low_attendance_employees.map((e) => (
            <div key={e.id} className="alert warning">
              <span className="alert-icon">⚠</span>
              <span>
                <strong>{e.first_name} {e.last_name}</strong> has {e.pct}% attendance
              </span>
            </div>
          ))}

          {data.needs_attention.pending_leave_count > 0 && (
            <div className="alert danger">
              <span className="alert-icon">!</span>
              <span>
                <strong>{data.needs_attention.pending_leave_count}</strong> pending leave requests
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}