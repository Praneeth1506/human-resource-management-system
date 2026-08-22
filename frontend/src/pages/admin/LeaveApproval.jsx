import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../services/api";
import "./AdminPages.css";

const STATUS_LABELS = { pending: "Pending", approved: "Approved", rejected: "Rejected" };

function LeaveApproval() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/leave"), api.get("/employees")])
      .then(([leaveRes, employeesRes]) => {
        const employeesById = {};
        employeesRes.data.forEach((emp) => {
          employeesById[emp.id] = emp;
        });

        const mapped = leaveRes.data.map((l) => {
          const emp = employeesById[l.employee_id];
          return {
            id: l.id,
            employee: emp ? `${emp.first_name} ${emp.last_name}` : `Employee #${l.employee_id}`,
            employeeId: emp ? emp.login_id : l.employee_id,
            type: l.leave_type.charAt(0).toUpperCase() + l.leave_type.slice(1),
            startDate: l.start_date,
            endDate: l.end_date,
            reason: l.remarks || "—",
            status: STATUS_LABELS[l.status] || l.status,
            comment: l.review_comment || "",
          };
        });
        setLeaves(mapped);
      })
      .catch(() => setError("Could not load leave requests."))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    const leave = leaves.find((l) => l.id === id);
    try {
      await api.put(`/leave/${id}/approve`, { comment: leave?.comment || null });
      setLeaves(leaves.map((l) => (l.id === id ? { ...l, status: "Approved" } : l)));
    } catch (err) {
      alert(err.response?.data?.detail || "Approve failed");
    }
  };

  const handleReject = async (id) => {
    const leave = leaves.find((l) => l.id === id);
    try {
      await api.put(`/leave/${id}/reject`, { comment: leave?.comment || null });
      setLeaves(leaves.map((l) => (l.id === id ? { ...l, status: "Rejected" } : l)));
    } catch (err) {
      alert(err.response?.data?.detail || "Reject failed");
    }
  };

  const handleCommentChange = (id, comment) => {
    setLeaves(
      leaves.map((leave) =>
        leave.id === id ? { ...leave, comment: comment } : leave
      )
    );
  };

  const pendingCount = leaves.filter((leave) => leave.status === "Pending").length;
  const approvedCount = leaves.filter((leave) => leave.status === "Approved").length;
  const rejectedCount = leaves.filter((leave) => leave.status === "Rejected").length;

  return (
    <Layout role="admin">
      <div className="admin-page">
        <div className="admin-header-block">
          <h1>Leave Approval</h1>
          <p>Review, approve, and manage employee leave requests.</p>
        </div>

        {/* Summary Cards */}
        <div className="admin-metrics-grid">
          <div className="admin-metric-card">
            <h3>Pending Requests</h3>
            <h2 style={{ color: "#f59e0b" }}>{pendingCount}</h2>
          </div>

          <div className="admin-metric-card">
            <h3>Approved Requests</h3>
            <h2 style={{ color: "#10b981" }}>{approvedCount}</h2>
          </div>

          <div className="admin-metric-card">
            <h3>Rejected Requests</h3>
            <h2 style={{ color: "#ef4444" }}>{rejectedCount}</h2>
          </div>
        </div>

        {/* Leave Requests Table */}
        <h2 style={{ margin: "0 0 14px", fontSize: "18px", color: "#0f172a" }}>All Leave Applications</h2>

        {loading && <p style={{ color: "#64748b" }}>Loading leave requests...</p>}
        {error && <p style={{ color: "#d33" }}>{error}</p>}

        {!loading && !error && (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Admin Note</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td><strong>{leave.employee}</strong></td>
                    <td>{leave.employeeId}</td>
                    <td>{leave.type}</td>
                    <td>{leave.startDate} to {leave.endDate}</td>
                    <td>{leave.reason}</td>

                    <td>
                      <input
                        type="text"
                        value={leave.comment}
                        onChange={(e) => handleCommentChange(leave.id, e.target.value)}
                        placeholder="Add note"
                        style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "1px solid #eaedf1",
                          fontSize: "13px",
                          width: "130px",
                        }}
                      />
                    </td>

                    <td>
                      <span
                        className={
                          leave.status === "Approved"
                            ? "present-badge"
                            : leave.status === "Pending"
                            ? "pending-badge"
                            : "status-rejected"
                        }
                      >
                        {leave.status}
                      </span>
                    </td>

                    <td>
                      {leave.status === "Pending" ? (
                        <div className="leave-action-buttons">
                          <button
                            onClick={() => handleApprove(leave.id)}
                            className="btn-approve"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => handleReject(leave.id)}
                            className="btn-reject"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>Reviewed</span>
                      )}
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

export default LeaveApproval;
