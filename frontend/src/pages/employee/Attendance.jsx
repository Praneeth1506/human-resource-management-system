import { useState } from "react";
import Layout from "../../components/Layout";
import api from "../../services/api";
import "./Attendance.css";

function Attendance() {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [error, setError] = useState("");

  const attendanceHistory = [
    {
      date: "22 Aug 2026",
      day: "Friday",
      checkIn: "09:12 AM",
      checkOut: "06:05 PM",
      hours: "08h 53m",
      status: "Present",
    },
    {
      date: "21 Aug 2026",
      day: "Thursday",
      checkIn: "09:05 AM",
      checkOut: "06:02 PM",
      hours: "08h 57m",
      status: "Present",
    },
    {
      date: "20 Aug 2026",
      day: "Wednesday",
      checkIn: "09:25 AM",
      checkOut: "06:10 PM",
      hours: "08h 45m",
      status: "Late",
    },
    {
      date: "19 Aug 2026",
      day: "Tuesday",
      checkIn: "-",
      checkOut: "-",
      hours: "-",
      status: "Leave",
    },
    {
      date: "18 Aug 2026",
      day: "Monday",
      checkIn: "09:08 AM",
      checkOut: "06:00 PM",
      hours: "08h 52m",
      status: "Present",
    },
  ];

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCheckIn = async () => {
    setError("");
    try {
      await api.post("/attendance/check-in");
      setCheckedIn(true);
      setCheckInTime(getCurrentTime());
    } catch (err) {
      setError(err.response?.data?.detail || "Check-in failed");
    }
  };

  const handleCheckOut = async () => {
    setError("");
    try {
      await api.post("/attendance/check-out");
      setCheckedOut(true);
      setCheckOutTime(getCurrentTime());
    } catch (err) {
      setError(err.response?.data?.detail || "Check-out failed");
    }
  };

  return (
    <Layout>
      <div className="attendance-page">

        {/* Heading */}
        <div className="attendance-heading">
          <div>
            <h1>Attendance</h1>
            <p>Track your daily attendance and working hours.</p>
          </div>

          <div className="attendance-date">
            📅 Friday, August 22, 2026
          </div>
        </div>

        {error && (
          <p style={{ color: "#d33", fontSize: "0.9rem", margin: "0 0 12px" }}>{error}</p>
        )}

        {/* Today's Attendance */}
        <div className="today-attendance-card">
          <div className="today-attendance-header">
            <div>
              <h2>Today's Attendance</h2>
              <p>Mark your attendance for today.</p>
            </div>

            <span
              className={
                checkedOut
                  ? "attendance-status completed"
                  : checkedIn
                  ? "attendance-status checked-in"
                  : "attendance-status not-marked"
              }
            >
              {checkedOut
                ? "Completed"
                : checkedIn
                ? "Checked In"
                : "Not Marked"}
            </span>
          </div>

          <div className="attendance-action-grid">
            <div className="attendance-time-card">
              <span className="attendance-label">CHECK IN</span>

              <h2>
                {checkInTime || "--:--"}
              </h2>

              <p>
                {checkedIn
                  ? "Attendance started"
                  : "You have not checked in yet"}
              </p>

              <button
                className="check-in-btn"
                onClick={handleCheckIn}
                disabled={checkedIn}
              >
                {checkedIn ? "Checked In ✓" : "Check In"}
              </button>
            </div>

            <div className="attendance-time-card">
              <span className="attendance-label">CHECK OUT</span>

              <h2>
                {checkOutTime || "--:--"}
              </h2>

              <p>
                {checkedOut
                  ? "Work day completed"
                  : checkedIn
                  ? "Complete your work day"
                  : "Check in first"}
              </p>

              <button
                className="check-out-btn"
                onClick={handleCheckOut}
                disabled={!checkedIn || checkedOut}
              >
                {checkedOut ? "Checked Out ✓" : "Check Out"}
              </button>
            </div>

            <div className="attendance-time-card working-hours-card">
              <span className="attendance-label">WORKING HOURS</span>

              <h2>
                {checkedIn && checkedOut ? "Today" : "00h 00m"}
              </h2>

              <p>
                {checkedIn && checkedOut
                  ? "Attendance completed"
                  : "Hours will be calculated"}
              </p>

              <div className="hours-progress">
                <div
                  className={
                    checkedIn
                      ? "hours-progress-fill active"
                      : "hours-progress-fill"
                  }
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="attendance-summary-grid">
          <div className="attendance-summary-card">
            <div className="attendance-summary-icon present-icon">✓</div>

            <div>
              <p>Present Days</p>
              <h2>18</h2>
              <span>This month</span>
            </div>
          </div>

          <div className="attendance-summary-card">
            <div className="attendance-summary-icon late-icon">◷</div>

            <div>
              <p>Late Days</p>
              <h2>2</h2>
              <span>This month</span>
            </div>
          </div>

          <div className="attendance-summary-card">
            <div className="attendance-summary-icon leave-icon">▣</div>

            <div>
              <p>Leave Days</p>
              <h2>2</h2>
              <span>This month</span>
            </div>
          </div>

          <div className="attendance-summary-card">
            <div className="attendance-summary-icon percentage-icon">%</div>

            <div>
              <p>Attendance Rate</p>
              <h2>82%</h2>
              <span>Current month</span>
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div className="attendance-history-card">
          <div className="attendance-history-heading">
            <div>
              <h2>Attendance History</h2>
              <p>Your recent attendance records.</p>
            </div>

            <select className="attendance-filter">
              <option>August 2026</option>
              <option>July 2026</option>
              <option>June 2026</option>
            </select>
          </div>

          <div className="attendance-table">
            <div className="attendance-table-header">
              <div>DATE</div>
              <div>CHECK IN</div>
              <div>CHECK OUT</div>
              <div>WORKING HOURS</div>
              <div>STATUS</div>
            </div>

            {attendanceHistory.map((item, index) => (
              <div className="attendance-table-row" key={index}>
                <div className="date-cell">
                  <strong>{item.date}</strong>
                  <span>{item.day}</span>
                </div>

                <div>{item.checkIn}</div>
                <div>{item.checkOut}</div>
                <div>{item.hours}</div>

                <div>
                  <span
                    className={`history-status ${item.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {item.status}
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

export default Attendance;