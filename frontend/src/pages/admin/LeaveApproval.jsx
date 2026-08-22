import { useState } from "react";
import Layout from "../../components/Layout";
import "./AdminPages.css";

function LeaveApproval() {
  const [leaves, setLeaves] = useState([
    {
      id: 1,
      employee: "Arun Kumar",
      employeeId: "EMP001",
      type: "Sick Leave",
      startDate: "2026-08-24",
      endDate: "2026-08-25",
      reason: "Medical treatment",
      status: "Pending",
      comment: "",
    },
    {
      id: 2,
      employee: "Priya Sharma",
      employeeId: "EMP002",
      type: "Casual Leave",
      startDate: "2026-08-26",
      endDate: "2026-08-26",
      reason: "Personal work",
      status: "Pending",
      comment: "",
    },
    {
      id: 3,
      employee: "Rahul Das",
      employeeId: "EMP003",
      type: "Earned Leave",
      startDate: "2026-08-28",
      endDate: "2026-08-29",
      reason: "Family function",
      status: "Approved",
      comment: "Approved",
    },
  ]);

  const handleStatusChange = (id, status) => {
    setLeaves(
      leaves.map((leave) =>
        leave.id === id ? { ...leave, status: status } : leave
      )
    );
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
                          onClick={() => handleStatusChange(leave.id, "Approved")}
                          className="btn-approve"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => handleStatusChange(leave.id, "Rejected")}
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
      </div>
    </Layout>
  );
}

export default LeaveApproval;