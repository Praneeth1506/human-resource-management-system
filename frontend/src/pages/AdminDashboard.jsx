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
        <div className="card"><h3>Employees</h3><p className="stat">{data.total_employees}</p></div>
        <div className="card"><h3>Present Today</h3><p className="stat">{data.present_today}</p></div>
        <div className="card"><h3>Absent Today</h3><p className="stat">{data.absent_today}</p></div>
        <div className="card"><h3>Pending Leave</h3><p className="stat">{data.pending_leaves}</p></div>
      </div>

      <div className="action-center">
        <h3>Needs Attention</h3>
        {data.needs_attention.low_attendance_employees.length === 0 &&
          data.needs_attention.pending_leave_count === 0 && <p>All clear ✅</p>}

        {data.needs_attention.low_attendance_employees.map((e) => (
          <div key={e.id} className="alert">
            ⚠ {e.first_name} {e.last_name} has {e.pct}% attendance
          </div>
        ))}

        {data.needs_attention.pending_leave_count > 0 && (
          <div className="alert">
            ⚠ {data.needs_attention.pending_leave_count} pending leave requests
          </div>
        )}
      </div>
    </div>
  );
}