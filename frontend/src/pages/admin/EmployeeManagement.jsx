import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../services/api";
import "./AdminPages.css";

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [search, setSearch] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [department, setDepartment] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const fetchEmployees = () => {
    setLoading(true);
    setListError("");
    return api
      .get("/employees")
      .then((res) => setEmployees(res.data))
      .catch(() => setListError("Could not load employees."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setJoiningDate("");
    setDepartment("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (editingId) {
      if (!firstName || !lastName || !email) {
        alert("Please fill in first name, last name, and email");
        return;
      }

      setEmployees(
        employees.map((employee) =>
          employee.id === editingId
            ? { ...employee, first_name: firstName, last_name: lastName, email, department }
            : employee
        )
      );

      setEditingId(null);
      alert("Employee updated successfully!");
      resetForm();
      return;
    }

    if (!firstName || !lastName || !email || !joiningDate) {
      alert("Please fill in first name, last name, email, and joining date");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/admin/employees", {
        first_name: firstName,
        last_name: lastName,
        email,
        joining_date: joiningDate,
        department: department || null,
      });
      setCreatedCredentials({ loginId: res.data.login_id, tempPassword: res.data.temp_password });
      resetForm();
      await fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.detail || "Failed to add employee");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingId(employee.id);
    setFirstName(employee.first_name);
    setLastName(employee.last_name);
    setEmail(employee.email);
    setDepartment(employee.department || "");
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (confirmDelete) {
      setEmployees(employees.filter((employee) => employee.id !== id));
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const q = search.toLowerCase();
    const displayName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
    const idString = (employee.login_id || String(employee.id)).toLowerCase();
    const dept = (employee.department || "").toLowerCase();
    return displayName.includes(q) || idString.includes(q) || dept.includes(q);
  });

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

        {createdCredentials && (
          <div
            className="admin-card"
            style={{ maxWidth: "640px", background: "#ecfdf5", border: "1px solid #10b981", marginBottom: "16px" }}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: "15px", color: "#065f46" }}>Employee created</h3>
            <p style={{ margin: "0 0 4px", fontSize: "14px" }}>
              Login ID: <strong>{createdCredentials.loginId}</strong>
            </p>
            <p style={{ margin: "0 0 8px", fontSize: "14px" }}>
              Temp Password: <strong>{createdCredentials.tempPassword}</strong>
            </p>
            <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#065f46" }}>
              Save these now and give them to the employee - the password won&apos;t be shown again.
            </p>
            <button
              type="button"
              className="secondary-btn small-btn"
              onClick={() => setCreatedCredentials(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Add/Edit Employee Form */}
        <div className="admin-card" style={{ maxWidth: "640px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "18px", color: "#0f172a" }}>
            {editingId ? "Edit Employee" : "Add New Employee"}
          </h2>

          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={inputStyle}
              placeholder="Enter first name"
            />

            <label style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={inputStyle}
              placeholder="Enter last name"
            />

            <label style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="Enter email"
            />

            {!editingId && (
              <>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Joining Date</label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  style={inputStyle}
                />
              </>
            )}

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

            {formError && (
              <p style={{ color: "#d33", fontSize: "0.85rem", marginTop: "-8px", marginBottom: "12px" }}>{formError}</p>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button type="submit" className="add-employee-button" disabled={submitting}>
                {submitting ? "Saving..." : editingId ? "Update Employee" : "Add Employee"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    resetForm();
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

        {loading && <p style={{ color: "#64748b" }}>Loading employees...</p>}
        {listError && <p style={{ color: "#d33" }}>{listError}</p>}

        {/* Employee Table */}
        {!loading && !listError && (
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
                    <td><strong>{employee.login_id || employee.id}</strong></td>
                    <td>{employee.first_name} {employee.last_name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.department || "—"}</td>

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
        )}
      </div>
    </Layout>
  );
}

export default EmployeeManagement;
