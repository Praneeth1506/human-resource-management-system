import { leaveBalance, leaveRequests, LEAVE_TYPES } from "../mock/leave";

const STATUS_CHIP_CLASS = {
  approved: "chip-green",
  pending: "chip-yellow",
  rejected: "chip-red",
};

const STATUS_LABEL = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

export default function Leave() {
  const remaining = leaveBalance.casual + leaveBalance.sick - leaveBalance.used;

  return (
    <div>
      <div className="payroll-page-header">
        <div>
          <span className="section-eyebrow">TIME OFF</span>
          <h1 className="dashboard-heading">Leave Overview</h1>
          <p className="dashboard-subtext">
            Balances and requests across casual, sick, and other leave types.
          </p>
        </div>
      </div>

      <section className="dashboard-grid">
        <div className="metric-card purple">
          <div className="metric-head">
            <span className="metric-title">Casual Leave</span>
            <div className="metric-icon-box purple"><span>✦</span></div>
          </div>
          <div className="metric-body">
            <div className="metric-value"><strong>{leaveBalance.casual}</strong></div>
          </div>
        </div>

        <div className="metric-card yellow">
          <div className="metric-head">
            <span className="metric-title">Sick Leave</span>
            <div className="metric-icon-box yellow"><span>✚</span></div>
          </div>
          <div className="metric-body">
            <div className="metric-value"><strong>{leaveBalance.sick}</strong></div>
          </div>
        </div>

        <div className="metric-card pink">
          <div className="metric-head">
            <span className="metric-title">Used</span>
            <div className="metric-icon-box pink"><span>−</span></div>
          </div>
          <div className="metric-body">
            <div className="metric-value"><strong>{leaveBalance.used}</strong></div>
          </div>
        </div>

        <div className="metric-card green">
          <div className="metric-head">
            <span className="metric-title">Remaining</span>
            <div className="metric-icon-box green"><span>✓</span></div>
          </div>
          <div className="metric-body">
            <div className="metric-value"><strong>{remaining}</strong></div>
          </div>
        </div>
      </section>

      <div className="saas-card">
        <div className="card-header-row">
          <div>
            <h2 className="card-title">Leave Requests</h2>
            <p className="card-subtitle">Available types: {LEAVE_TYPES.join(", ")}</p>
          </div>
        </div>

        <div className="simple-table-wrap">
          <table className="simple-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Remarks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((row) => (
                <tr key={row.id}>
                  <td>{row.type}</td>
                  <td>{row.startDate}</td>
                  <td>{row.endDate}</td>
                  <td>{row.days}</td>
                  <td>{row.remarks}</td>
                  <td>
                    <span className={`status-chip ${STATUS_CHIP_CLASS[row.status]}`}>
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
