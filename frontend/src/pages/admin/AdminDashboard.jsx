import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

function AdminDashboard() {
  const employees = [
    {
      id: "EMP001",
      name: "Arun Kumar",
      department: "Engineering",
      status: "Present",
    },
    {
      id: "EMP002",
      name: "Priya Sharma",
      department: "Human Resources",
      status: "Present",
    },
    {
      id: "EMP003",
      name: "Rahul Das",
      department: "Finance",
      status: "Absent",
    },
    {
      id: "EMP004",
      name: "Sneha R",
      department: "Engineering",
      status: "Present",
    },
  ];

  const cardStyle = {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
  };

  const thStyle = {
    padding: "15px",
    textAlign: "left",
    borderBottom: "1px solid #ddd",
  };

  const tdStyle = {
    padding: "15px",
    borderBottom: "1px solid #eee",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1 }}>
        <Navbar />

        <main
          style={{
            padding: "30px",
            backgroundColor: "#f5f6fa",
            minHeight: "calc(100vh - 70px)",
          }}
        >
          <h1>Admin Dashboard</h1>
          <p>Overview of your organization.</p>

          {/* Statistics Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              marginTop: "25px",
              marginBottom: "30px",
            }}
          >
            <div style={cardStyle}>
              <h3>Total Employees</h3>
              <h2>48</h2>
            </div>

            <div style={cardStyle}>
              <h3>Present Today</h3>
              <h2>42</h2>
            </div>

            <div style={cardStyle}>
              <h3>Absent Today</h3>
              <h2>3</h2>
            </div>

            <div style={cardStyle}>
              <h3>Pending Leaves</h3>
              <h2>5</h2>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "10px",
              marginBottom: "30px",
            }}
          >
            <h2>Quick Actions</h2>

            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              <button style={buttonStyle}>Manage Employees</button>

              <button style={buttonStyle}>Approve Leaves</button>

              <button style={buttonStyle}>View Attendance</button>
            </div>
          </div>

          {/* Employee Table */}
          <h2>Recent Employees</h2>

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
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Employee ID</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td style={tdStyle}>{employee.id}</td>
                    <td style={tdStyle}>{employee.name}</td>
                    <td style={tdStyle}>{employee.department}</td>
                    <td style={tdStyle}>{employee.status}</td>
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

const buttonStyle = {
  padding: "10px 18px",
  cursor: "pointer",
};

export default AdminDashboard;