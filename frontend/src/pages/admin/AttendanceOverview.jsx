import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../services/api";
import "./AdminPages.css";

function AttendanceOverview() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    Promise.all([api.get(`/attendance?date=${todayIso}`), api.get("/employees")])
      .then(([attendanceRes, employeesRes]) => {
        const employeesById = {};
        employeesRes.data.forEach((emp) => {
          employeesById[emp.id] = emp;
        });

        const mapped = attendanceRes.data.map((record) => {
          const emp = employeesById[record.employee_id];
          return {
            id: record.id,
            employeeName: emp ? `${emp.first_name} ${emp.last_name}` : `Employee #${record.employee_id}`,
            employeeId: emp ? emp.login_id : record.employee_id,
            checkIn: record.check_in ? record.check_in.slice(0, 5) : "—",
            checkOut: record.check_out ? record.check_out.slice(0, 5) : "—",
            status: record.status || "—",
          };
        });

        setRecords(mapped);
      })
      .catch(() => setError("Could not load attendance records."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout role="admin">
      <div className="admin-page">
        <div className="admin-header-block">
          <h1>Attendance Overview</h1>
          <p>Today&apos;s attendance across all employees.</p>
        </div>

        {loading && <p style={{ color: "#64748b" }}>Loading attendance...</p>}
        {error && <p style={{ color: "#d33" }}>{error}</p>}

        {!loading && !error && (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>
                      No attendance records for today yet.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id}>
                      <td><strong>{record.employeeId}</strong></td>
                      <td>{record.employeeName}</td>
                      <td>{record.checkIn}</td>
                      <td>{record.checkOut}</td>
                      <td>
                        <span className={record.status === "present" ? "present-badge" : "status-rejected"}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AttendanceOverview;
