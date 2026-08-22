import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../services/api";
import "./AdminPages.css";

const defaultEmployees = [
  { id: "EMP001", name: "Arun Kumar", department: "Engineering", status: "Present" },
  { id: "EMP002", name: "Priya Sharma", department: "Human Resources", status: "Present" },
  { id: "EMP003", name: "Rahul Das", department: "Finance", status: "Absent" },
  { id: "EMP004", name: "Sneha R", department: "Engineering", status: "Present" },
];

function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get("/dashboard/admin")
      .then((res) => setData(res.data))
      .catch(() => {
        setData({
          total_employees: 48,
          present_today: 42,
          absent_today: 3,
          pending_leaves: 5,
          needs_attention: {
            low_attendance_employees: [],
            pending_leave_count: 5,
          },
        });
      });
  }, []);

  const stats = data || {
    total_employees: 48,
    present_today: 42,
    absent_today: 3,
    pending_leaves: 5,
    needs_attention: { low_attendance_employees: [], pending_leave_count: 5 },
  };

  return (
    <Layout role="admin">
      <div className="admin-page">
        <div className="admin-header-block">
          <h1>Admin Dashboard</h1>
          <p>Overview of your organization and real-time operations.</p>
        </div>

        {/* Statistics Cards */}
        <div className="admin-metrics-grid">
          <div className="admin-metric-card">
            <h3>Total Employees</h3>
            <h2>{stats.total_employees}</h2>
          </div>

          <div className="admin-metric-card">
            <h3>Present Today</h3>
            <h2 style={{ color: "#10b981" }}>{stats.present_today}</h2>
          </div>

          <div className="admin-metric-card">
            <h3>Absent Today</h3>
            <h2 style={{ color: "#ef4444" }}>{stats.absent_today}</h2>
          </div>

          <div className="admin-metric-card">
            <h3>Pending Leaves</h3>
            <h2 style={{ color: "#f59e0b" }}>{stats.pending_leaves}</h2>
          </div>
        </div>

        {/* Action Center – Needs Attention */}
        {stats.needs_attention && (
          <div className="admin-card" style={{ marginBottom: "24px" }}>
            <h2 style={{ margin: "0 0 14px", fontSize: "16px", color: "#0f172a" }}>
              ⚡ Needs Attention
            </h2>

            {stats.needs_attention.low_attendance_employees.length === 0 &&
              stats.needs_attention.pending_leave_count === 0 && (
                <p style={{ color: "#64748b", fontSize: "14px" }}>All clear ✅ No issues today.</p>
              )}

            {stats.needs_attention.low_attendance_employees.map((e) => (
              <div
                key={e.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 14px",
                  background: "#fff7ec",
                  borderLeft: "4px solid #f59e0b",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "#1e293b",
                }}
              >
                ⚠ {e.first_name} {e.last_name} has only {e.pct}% attendance this month
              </div>
            ))}

            {stats.needs_attention.pending_leave_count > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 14px",
                  background: "#fff7ec",
                  borderLeft: "4px solid #f59e0b",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "#1e293b",
                }}
              >
                ⚠ {stats.needs_attention.pending_leave_count} pending leave requests awaiting review
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="admin-card">
          <h2 style={{ margin: "0 0 16px", fontSize: "18px", color: "#0f172a" }}>Quick Actions</h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a href="/admin/employees" className="primary-btn" style={{ textDecoration: "none" }}>
              Manage Employees
            </a>
            <a href="/admin/leave" className="secondary-btn" style={{ textDecoration: "none" }}>
              Approve Leaves
            </a>
            <a href="/attendance" className="secondary-btn" style={{ textDecoration: "none" }}>
              View Attendance
            </a>
          </div>
        </div>

        {/* Employee Table */}
        <h2 style={{ margin: "24px 0 14px", fontSize: "18px", color: "#0f172a" }}>Recent Employees</h2>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {defaultEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td><strong>{employee.id}</strong></td>
                  <td>{employee.name}</td>
                  <td>{employee.department}</td>
                  <td>
                    <span className={employee.status === "Present" ? "present-badge" : "status-rejected"}>
                      {employee.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default AdminDashboard;