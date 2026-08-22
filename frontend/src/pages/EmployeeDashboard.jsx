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
      <div className="card">
        <h3>Attendance</h3>
        <p className="stat">{data.attendance_percent}%</p>
      </div>
      <div className="card">
        <h3>Leave Balance</h3>
        <p className="stat">{data.leave_balance} days</p>
      </div>
      <div className="card">
        <h3>Salary</h3>
        <p className="stat">₹{data.latest_net_pay ?? "—"}</p>
      </div>
    </div>
  );
}