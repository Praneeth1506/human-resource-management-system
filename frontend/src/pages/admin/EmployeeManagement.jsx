import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

function EmployeeManagement() {
  const [employees, setEmployees] = useState([
    {
      id: "EMP001",
      name: "Arun Kumar",
      email: "arun@example.com",
      department: "Engineering",
    },
    {
      id: "EMP002",
      name: "Priya Sharma",
      email: "priya@example.com",
      department: "Human Resources",
    },
    {
      id: "EMP003",
      name: "Rahul Das",
      email: "rahul@example.com",
      department: "Finance",
    },
  ]);

  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");

  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !department) {
      alert("Please fill in all fields");
      return;
    }

    if (editingId) {
      setEmployees(
        employees.map((employee) =>
          employee.id === editingId
            ? { ...employee, name, email, department }
            : employee
        )
      );

      setEditingId(null);
      alert("Employee updated successfully!");
    } else {
      const newEmployee = {
        id: `EMP${String(employees.length + 1).padStart(3, "0")}`,
        name,
        email,
        department,
      };

      setEmployees([...employees, newEmployee]);
      alert("Employee added successfully!");
    }

    setName("");
    setEmail("");
    setDepartment("");
  };

  const handleEdit = (employee) => {
    setEditingId(employee.id);
    setName(employee.name);
    setEmail(employee.email);
    setDepartment(employee.department);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (confirmDelete) {
      setEmployees(employees.filter((employee) => employee.id !== id));
    }
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(search.toLowerCase()) ||
      employee.id.toLowerCase().includes(search.toLowerCase()) ||
      employee.department.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    marginBottom: "15px",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    padding: "10px 16px",
    cursor: "pointer",
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
          <h1>Employee Management</h1>
          <p>Add, edit, delete, and manage employees.</p>

          {/* Add/Edit Employee Form */}
          <div
            style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "10px",
              marginTop: "25px",
              marginBottom: "30px",
              maxWidth: "700px",
            }}
          >
            <h2>
              {editingId ? "Edit Employee" : "Add New Employee"}
            </h2>

            <form onSubmit={handleSubmit}>
              <label>Employee Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                placeholder="Enter employee name"
              />

              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                placeholder="Enter email"
              />

              <label>Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select Department</option>
                <option>Engineering</option>
                <option>Human Resources</option>
                <option>Finance</option>
                <option>Marketing</option>
              </select>

              <button type="submit" style={buttonStyle}>
                {editingId ? "Update Employee" : "Add Employee"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setName("");
                    setEmail("");
                    setDepartment("");
                  }}
                  style={{
                    ...buttonStyle,
                    marginLeft: "10px",
                  }}
                >
                  Cancel
                </button>
              )}
            </form>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search by name, ID, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              ...inputStyle,
              maxWidth: "500px",
            }}
          />

          {/* Employee Table */}
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
                  <th style={styles.th}>Employee ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td style={styles.td}>{employee.id}</td>
                    <td style={styles.td}>{employee.name}</td>
                    <td style={styles.td}>{employee.email}</td>
                    <td style={styles.td}>{employee.department}</td>

                    <td style={styles.td}>
                      <button
                        onClick={() => handleEdit(employee)}
                        style={{
                          padding: "7px 12px",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(employee.id)}
                        style={{
                          padding: "7px 12px",
                          marginLeft: "8px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
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
  th: {
    padding: "15px",
    textAlign: "left",
    borderBottom: "1px solid #ddd",
  },
  td: {
    padding: "15px",
    borderBottom: "1px solid #eee",
  },
};

export default EmployeeManagement;