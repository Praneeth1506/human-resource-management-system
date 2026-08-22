import { useState } from "react";
import Layout from "../../components/Layout";
import "./Leave.css";

function Leave() {
  const [showForm, setShowForm] = useState(false);
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      type: "Casual Leave",
      from: "18 Aug 2026",
      to: "18 Aug 2026",
      days: 1,
      reason: "Personal work",
      status: "Pending",
    },
    {
      id: 2,
      type: "Sick Leave",
      from: "10 Aug 2026",
      to: "11 Aug 2026",
      days: 2,
      reason: "Medical leave",
      status: "Approved",
    },
  ]);

  const calculateDays = () => {
    if (!fromDate || !toDate) return 0;

    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (end < start) return 0;

    const difference = end - start;
    return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fromDate || !toDate || !reason.trim()) {
      alert("Please fill all required details");
      return;
    }

    if (new Date(toDate) < new Date(fromDate)) {
      alert("To Date cannot be before From Date");
      return;
    }

    const newLeave = {
      id: Date.now(),
      type: leaveType,
      from: formatDate(fromDate),
      to: formatDate(toDate),
      days: calculateDays(),
      reason,
      status: "Pending",
    };

    setLeaveRequests([newLeave, ...leaveRequests]);

    setLeaveType("Casual Leave");
    setFromDate("");
    setToDate("");
    setReason("");
    setShowForm(false);

    alert("Leave request submitted successfully!");
  };

  return (
    <Layout>
      <div className="leave-page">
        {/* Heading */}
        <div className="leave-heading">
          <div>
            <h1>Leave Management</h1>
            <p>Apply for leave and track your leave requests.</p>
          </div>

          <button
            className="apply-leave-btn"
            onClick={() => setShowForm(!showForm)}
          >
            <span>+</span>
            Apply Leave
          </button>
        </div>

        {/* Leave Balance Cards */}
        <div className="leave-balance-grid">
          <div className="leave-balance-card">
            <div className="balance-icon casual-icon">◷</div>

            <div>
              <p>Casual Leave</p>
              <h2>4 <span>Days</span></h2>
              <small>Available balance</small>
            </div>
          </div>

          <div className="leave-balance-card">
            <div className="balance-icon sick-icon">✚</div>

            <div>
              <p>Sick Leave</p>
              <h2>3 <span>Days</span></h2>
              <small>Available balance</small>
            </div>
          </div>

          <div className="leave-balance-card">
            <div className="balance-icon earned-icon">★</div>

            <div>
              <p>Earned Leave</p>
              <h2>1 <span>Day</span></h2>
              <small>Available balance</small>
            </div>
          </div>
        </div>

        {/* Apply Leave Form */}
        {showForm && (
          <div className="apply-leave-card">
            <div className="apply-card-heading">
              <div>
                <h2>Apply for Leave</h2>
                <p>Fill in the details below to submit your request.</p>
              </div>

              <button
                className="close-form-btn"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="leave-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Leave Type</label>

                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                  >
                    <option>Casual Leave</option>
                    <option>Sick Leave</option>
                    <option>Earned Leave</option>
                    <option>Unpaid Leave</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Number of Days</label>

                  <div className="days-display">
                    {calculateDays() || 0} Day
                    {calculateDays() !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>From Date</label>

                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>To Date</label>

                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason for Leave</label>

                <textarea
                  placeholder="Enter the reason for your leave..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows="4"
                />
              </div>

              <div className="leave-form-actions">
                <button
                  type="button"
                  className="cancel-leave-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="submit-leave-btn">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Leave History */}
        <div className="leave-history-card">
          <div className="leave-history-heading">
            <div>
              <h2>Leave History</h2>
              <p>Your recent leave requests</p>
            </div>

            <select className="leave-filter">
              <option>All Requests</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>

          <div className="leave-table">
            <div className="leave-table-header">
              <div>LEAVE TYPE</div>
              <div>FROM</div>
              <div>TO</div>
              <div>DAYS</div>
              <div>REASON</div>
              <div>STATUS</div>
            </div>

            {leaveRequests.map((leave) => (
              <div className="leave-table-row" key={leave.id}>
                <div className="leave-type-cell">
                  <span className="leave-type-icon">
                    {leave.type === "Sick Leave" ? "✚" : "◷"}
                  </span>
                  {leave.type}
                </div>

                <div>{leave.from}</div>
                <div>{leave.to}</div>
                <div>{leave.days}</div>
                <div className="reason-cell">{leave.reason}</div>

                <div>
                  <span
                    className={`leave-status ${leave.status.toLowerCase()}`}
                  >
                    {leave.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Leave;