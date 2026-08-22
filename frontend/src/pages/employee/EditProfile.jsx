import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import "./EditProfile.css";

function EditProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "Arun Kumar",
    email: "arun@example.com",
    phone: "+91 98765 43210",
    dob: "1998-03-15",
    gender: "Male",
    address: "Coimbatore, Tamil Nadu",
    department: "Engineering",
    designation: "Software Developer",
    location: "Coimbatore Office",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Profile updated successfully!");

    navigate("/profile");
  };

  return (
    <Layout>
      <div className="edit-profile-page">
        <div className="edit-profile-heading">
          <div>
            <h1>Edit Profile</h1>
            <p>Update your personal and professional information.</p>
          </div>

          <button
            className="back-profile-button"
            onClick={() => navigate("/profile")}
          >
            ← Back to Profile
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* PERSONAL INFORMATION */}
          <div className="edit-section-card">
            <div className="edit-section-heading">
              <div>
                <h2>Personal Information</h2>
                <p>Update your basic personal details</p>
              </div>
            </div>

            <div className="edit-form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* WORK INFORMATION */}
          <div className="edit-section-card">
            <div className="edit-section-heading">
              <div>
                <h2>Work Information</h2>
                <p>Your current employment details</p>
              </div>
            </div>

            <div className="edit-form-grid">
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Work Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Employee ID</label>
                <input type="text" value="EMP001" disabled />
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="edit-profile-actions">
            <button
              type="button"
              className="cancel-edit-button"
              onClick={() => navigate("/profile")}
            >
              Cancel
            </button>

            <button type="submit" className="save-profile-button">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default EditProfile;