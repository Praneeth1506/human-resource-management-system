import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
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
        leave.id === id
          ? { ...leave, status: status }
          : leave
      )
    );
  };

  const handleCommentChange = (id, comment) => {
    setLeaves(
      leaves.map((leave) =>
        leave.id === id
          ? { ...leave, comment: comment }
          : leave
      )
    );
  };

  const pendingCount = leaves.filter(
    (leave) => leave.status === "Pending"
  ).length;

  const approvedCount = leaves.filter(
    (leave) => leave.status === "Approved"
  ).length;

  const rejectedCount = leaves.filter(
    (leave) => leave.status === "Rejected"
  ).length;

  return (
    <div className="admin-page" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar role="admin" />

      <div className="admin-content" style={{ flex: 1 }}>
        <Navbar />

        <main
          style={{
            padding: "30px",
            backgroundColor: "#f5f6fa",
            minHeight: "calc(100vh - 70px)",
          }}
        >
          <h1>Leave Approval</h1>
          <p>Review and manage employee leave requests.</p>

          {/* Summary Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "20px",
              marginTop: "25px",
              marginBottom: "30px",
            }}
          >
            <div style={styles.card}>
              <h3>Pending</h3>
              <h2>{pendingCount}</h2>
            </div>

            <div style={styles.card}>
              <h3>Approved</h3>
              <h2>{approvedCount}</h2>
            </div>

            <div style={styles.card}>
              <h3>Rejected</h3>
              <h2>{rejectedCount}</h2>
            </div>
          </div>

          {/* Leave Requests */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "10px",
              overflow: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "1000px",
              }}
            >
              <thead>
                <tr>
                  <th style={styles.th}>Employee</th>
                  <th style={styles.th}>Employee ID</th>
                  <th style={styles.th}>Leave Type</th>
                  <th style={styles.th}>Start Date</th>
                  <th style={styles.th}>End Date</th>
                  <th style={styles.th}>Reason</th>
                  <th style={styles.th}>Admin Comment</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td style={styles.td}>{leave.employee}</td>
                    <td style={styles.td}>{leave.employeeId}</td>
                    <td style={styles.td}>{leave.type}</td>
                    <td style={styles.td}>{leave.startDate}</td>
                    <td style={styles.td}>{leave.endDate}</td>
                    <td style={styles.td}>{leave.reason}</td>

                    <td style={styles.td}>
                      <input
                        type="text"
                        value={leave.comment}
                        onChange={(e) =>
                          handleCommentChange(
                            leave.id,
                            e.target.value
                          )
                        }
                        placeholder="Add comment"
                        style={{
                          padding: "8px",
                          width: "150px",
                        }}
                      />
                    </td>

                    <td style={styles.td}>
                      <strong>{leave.status}</strong>
                    </td>

                    <td className="leave-action-cell" style={styles.td}>
                      {leave.status === "Pending" ? (
                        <div className="leave-action-buttons">
                          <button
                            onClick={() =>
                              handleStatusChange(
                                leave.id,
                                "Approved"
                              )
                            }
                            style={styles.approveButton}
                          >
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              handleStatusChange(
                                leave.id,
                                "Rejected"
                              )
                            }
                            style={styles.rejectButton}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span>Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
  },

  th: {
    padding: "15px",
    textAlign: "left",
    borderBottom: "1px solid #ddd",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "15px",
    borderBottom: "1px solid #eee",
  },

  approveButton: {
    padding: "8px 12px",
    cursor: "pointer",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "#256c69",
    color: "white",
    fontWeight: "600",
  },

  rejectButton: {
    padding: "8px 12px",
    cursor: "pointer",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "#b94a48",
    color: "white",
    fontWeight: "600",
  },
};

export default LeaveApproval;