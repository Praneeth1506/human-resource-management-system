import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import "./EmployeeDashboard.css";

function EmployeeDashboard() {
  return (
    <Layout>
      <div className="dashboard-page">
        {/* Page Heading */}
        <div className="dashboard-heading">
          <div>
            <h1>Good Morning, Arun! 👋</h1>
            <p>Here is what's happening with your work today.</p>
          </div>

          <div className="dashboard-date">
            <span>📅</span>
            <span>Friday, August 22, 2026</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon blue-icon">◷</div>

            <div>
              <p>Working Days</p>
              <h2>22</h2>
              <span className="summary-text">This month</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon green-icon">✓</div>

            <div>
              <p>Present Days</p>
              <h2>18</h2>
              <span className="summary-success">↑ 82% Attendance</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon orange-icon">◉</div>

            <div>
              <p>Leave Balance</p>
              <h2>8</h2>
              <span className="summary-text">Days remaining</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon purple-icon">₹</div>

            <div>
              <p>Next Salary</p>
              <h2>₹45,000</h2>
              <span className="summary-text">Expected this month</span>
            </div>
          </div>
        </div>

        {/* Middle Section */}
        <div className="dashboard-main-grid">

          {/* Attendance Card */}
          <div className="today-card">
            <div className="card-heading">
              <div>
                <h2>Today's Attendance</h2>
                <p>Friday, August 22</p>
              </div>

              <span className="present-badge">Present</span>
            </div>

            <div className="attendance-time-grid">
              <div className="time-box">
                <span className="time-label">CHECK IN</span>
                <h3>09:12 AM</h3>
              </div>

              <div className="time-box">
                <span className="time-label">CHECK OUT</span>
                <h3>06:05 PM</h3>
              </div>

              <div className="time-box">
                <span className="time-label">WORKING HOURS</span>
                <h3>08h 53m</h3>
              </div>
            </div>

            <div className="working-progress">
              <div className="progress-info">
                <span>Today's progress</span>
                <strong>8h 53m / 9h</strong>
              </div>

              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-card">
            <h2>Quick Actions</h2>

            <Link to="/attendance" className="quick-action">
              <span className="quick-action-icon">◷</span>

              <div>
                <strong>View Attendance</strong>
                <p>Check your attendance history</p>
              </div>

              <span className="quick-arrow">→</span>
            </Link>

            <Link to="/leave" className="quick-action">
              <span className="quick-action-icon">▣</span>

              <div>
                <strong>Apply Leave</strong>
                <p>Submit a new leave request</p>
              </div>

              <span className="quick-arrow">→</span>
            </Link>

            <Link to="/payroll" className="quick-action">
              <span className="quick-action-icon">₹</span>

              <div>
                <strong>View Payroll</strong>
                <p>Check salary details</p>
              </div>

              <span className="quick-arrow">→</span>
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="dashboard-bottom-grid">

          {/* Recent Leave */}
          <div className="recent-leave-card">
            <div className="section-heading">
              <h2>Recent Leave Requests</h2>
              <span>View All</span>
            </div>

            <div className="leave-item">
              <div className="leave-date">
                <strong>18</strong>
                <span>AUG</span>
              </div>

              <div className="leave-info">
                <strong>Casual Leave</strong>
                <p>1 Day • Personal work</p>
              </div>

              <span className="pending-badge">Pending</span>
            </div>

            <div className="leave-item">
              <div className="leave-date">
                <strong>10</strong>
                <span>AUG</span>
              </div>

              <div className="leave-info">
                <strong>Sick Leave</strong>
                <p>2 Days • Medical leave</p>
              </div>

              <span className="approved-badge">Approved</span>
            </div>
          </div>

          {/* Upcoming */}
          <div className="upcoming-card">
            <div className="section-heading">
              <h2>Upcoming Holidays</h2>
              <span>View Calendar</span>
            </div>

            <div className="holiday-item">
              <div className="holiday-icon">🎉</div>

              <div>
                <strong>Onam</strong>
                <p>August 26, 2026</p>
              </div>
            </div>

            <div className="holiday-item">
              <div className="holiday-icon">🇮🇳</div>

              <div>
                <strong>Independence Day</strong>
                <p>August 15, 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default EmployeeDashboard;