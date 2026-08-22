import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../services/api";
import "./AdminPages.css";

const RECENT_EMPLOYEES_COUNT = 4;

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState("");

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

  useEffect(() => {
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    Promise.all([api.get("/employees"), api.get(`/attendance?date=${todayIso}`)])
      .then(([employeesRes, attendanceRes]) => {
        const statusByEmployeeId = {};
        attendanceRes.data.forEach((record) => {
          statusByEmployeeId[record.employee_id] = record.status;
        });

        const merged = [...employeesRes.data]
          .sort((a, b) => b.id - a.id)
          .slice(0, RECENT_EMPLOYEES_COUNT)
          .map((employee) => ({
            ...employee,
            todayStatus: statusByEmployeeId[employee.id] || "Not Marked",
          }));

        setRecentEmployees(merged);
      })
      .catch(() => setRecentError("Could not load recent employees."))
      .finally(() => setRecentLoading(false));
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

        {recentLoading && <p style={{ color: "#64748b" }}>Loading recent employees...</p>}
        {recentError && <p style={{ color: "#d33" }}>{recentError}</p>}

        {!recentLoading && !recentError && (
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
                {recentEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td><strong>{employee.login_id}</strong></td>
                    <td>{employee.first_name} {employee.last_name}</td>
                    <td>{employee.department || "—"}</td>
                    <td>
                      <span className={employee.todayStatus === "present" ? "present-badge" : "status-rejected"}>
                        {employee.todayStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AdminDashboard;