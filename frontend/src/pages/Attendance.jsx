import { attendanceSummary, attendanceHistory, WORK_START_TIME } from "../mock/attendance";

const STATUS_CHIP_CLASS = {
  present: "chip-green",
  approved: "chip-green",
  late: "chip-yellow",
  pending: "chip-yellow",
  absent: "chip-red",
  rejected: "chip-red",
  leave: "chip-blue",
  half_day: "chip-blue",
};

const STATUS_LABEL = {
  present: "Present",
  absent: "Absent",
  half_day: "Half Day",
  leave: "Leave",
  late: "Late",
};

export default function Attendance() {
  return (
    <div>
      <div className="payroll-page-header">
        <div>
          <span className="section-eyebrow">ATTENDANCE</span>
          <h1 className="dashboard-heading">Attendance Overview</h1>
          <p className="dashboard-subtext">
            Daily check-ins, check-outs, and monthly attendance trends.
          </p>
        </div>
      </div>

      <section className="dashboard-grid">
        <div className="metric-card green">
          <div className="metric-head">
            <span className="metric-title">Present</span>
            <div className="metric-icon-box green"><span>✓</span></div>
          </div>
          <div className="metric-body">
            <div className="metric-value"><strong>{attendanceSummary.present}</strong></div>
          </div>
        </div>

        <div className="metric-card pink">
          <div className="metric-head">
            <span className="metric-title">Absent</span>
            <div className="metric-icon-box pink"><span>✕</span></div>
          </div>
          <div className="metric-body">
            <div className="metric-value"><strong>{attendanceSummary.absent}</strong></div>
          </div>
        </div>

        <div className="metric-card purple">
          <div className="metric-head">
            <span className="metric-title">Leave</span>
            <div className="metric-icon-box purple"><span>✈</span></div>
          </div>
          <div className="metric-body">
            <div className="metric-value"><strong>{attendanceSummary.leave}</strong></div>
          </div>
        </div>

        <div className="metric-card yellow">
          <div className="metric-head">
            <span className="metric-title">Attendance %</span>
            <div className="metric-icon-box yellow"><span>◔</span></div>
          </div>
          <div className="metric-body">
            <div className="metric-value">
              <strong>{attendanceSummary.attendancePercentage}</strong>
              <span className="metric-unit">%</span>
            </div>
          </div>
        </div>
      </section>

      <div className="saas-card">
        <div className="card-header-row">
          <div>
            <h2 className="card-title">Attendance History</h2>
            <p className="card-subtitle">Standard work start time: {WORK_START_TIME}</p>
          </div>
        </div>

        <div className="simple-table-wrap">
          <table className="simple-table">
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
