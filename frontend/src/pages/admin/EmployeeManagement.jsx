import { useState } from "react";
import Layout from "../../components/Layout";
import "./AdminPages.css";

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
    padding: "10px 14px",
    marginTop: "5px",
    marginBottom: "15px",
    boxSizing: "border-box",
    border: "1px solid #eaedf1",
    borderRadius: "8px",
    fontSize: "14px",
  };

  return (
    <Layout role="admin">
      <div className="admin-page">
        <div className="admin-header-block">
          <h1>Employee Management</h1>
          <p>Add, edit, delete, and manage organization personnel.</p>
        </div>

        {/* Add/Edit Employee Form */}
        <div className="admin-card" style={{ maxWidth: "640px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "18px", color: "#0f172a" }}>
            {editingId ? "Edit Employee" : "Add New Employee"}
          </h2>

          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Employee Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              placeholder="Enter employee name"
            />

            <label style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="Enter email"
            />

            <label style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Department</label>
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

            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button type="submit" className="add-employee-button">
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
                  className="secondary-btn"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Search by name, ID, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              ...inputStyle,
              maxWidth: "400px",
              marginBottom: 0,
            }}
          />
        </div>

        {/* Employee Table */}
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td><strong>{employee.id}</strong></td>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>{employee.department}</td>

                  <td>
                    <button
                      onClick={() => handleEdit(employee)}
                      className="secondary-btn small-btn"
                      style={{ marginRight: "8px" }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="btn-reject"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default EmployeeManagement;