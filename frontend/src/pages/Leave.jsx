import { leaveBalance, leaveRequests, LEAVE_TYPES } from "../mock/leave";

export default function Leave() {
  const remaining = leaveBalance.casual + leaveBalance.sick - leaveBalance.used;

  return (
    <div>
      <div className="dashboard-grid">
        <div className="card"><h3>Casual Leave</h3><p className="stat">{leaveBalance.casual}</p></div>
        <div className="card"><h3>Sick Leave</h3><p className="stat">{leaveBalance.sick}</p></div>
        <div className="card"><h3>Used</h3><p className="stat">{leaveBalance.used}</p></div>
        <div className="card"><h3>Remaining</h3><p className="stat">{remaining}</p></div>
      </div>

      <div className="table-card">
        <h2>Leave Requests</h2>
        <p className="table-subtitle">Available types: {LEAVE_TYPES.join(", ")}</p>
        <table>
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
                  <span className={`status-pill status-${row.status}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
