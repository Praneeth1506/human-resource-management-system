import { attendanceSummary, attendanceHistory, WORK_START_TIME } from "../mock/attendance";

export default function Attendance() {
  return (
    <div>
      <div className="dashboard-grid">
        <div className="card"><h3>Present</h3><p className="stat">{attendanceSummary.present}</p></div>
        <div className="card"><h3>Absent</h3><p className="stat">{attendanceSummary.absent}</p></div>
        <div className="card"><h3>Leave</h3><p className="stat">{attendanceSummary.leave}</p></div>
        <div className="card"><h3>Attendance %</h3><p className="stat">{attendanceSummary.attendancePercentage}%</p></div>
      </div>

      <div className="table-card">
        <h2>Attendance History</h2>
        <p className="table-subtitle">Standard work start time: {WORK_START_TIME}</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Working Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceHistory.map((row) => (
              <tr key={row.date}>
                <td>{row.date}</td>
                <td>{row.checkIn ?? "—"}</td>
                <td>{row.checkOut ?? "—"}</td>
                <td>{row.workingHours ?? "—"}</td>
                <td>
                  <span className={`status-pill status-${row.status}`}>
                    {row.status.replace("_", " ")}
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
