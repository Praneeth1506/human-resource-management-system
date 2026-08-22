import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="profile-page">
        <div className="profile-heading">
          <div>
            <h1>My Profile</h1>
            <p>View and manage your personal information.</p>
          </div>

          <button
            className="edit-profile-button"
            onClick={() => navigate("/edit-profile")}
          >
            ✎ Edit Profile
          </button>
        </div>

        {/* Profile Header */}
        <div className="profile-card">
          <div className="profile-top">
            <div className="profile-avatar">AR</div>

            <div className="profile-main-info">
              <h2>Arun Kumar</h2>
              <p>Software Developer</p>
              <span>Employee ID: EMP001</span>
            </div>

            <div className="profile-status">
              <span className="active-dot"></span>
              Active Employee
            </div>
          </div>
        </div>

        <div className="profile-grid">
          {/* Personal Information */}
          <div className="profile-section-card">
            <div className="profile-section-heading">
              <div className="section-icon personal-icon">👤</div>
              <div>
                <h2>Personal Information</h2>
                <p>Your basic personal details</p>
              </div>
            </div>

            <div className="profile-info-grid">
              <div className="profile-info">
                <span>FULL NAME</span>
                <strong>Arun Kumar</strong>
              </div>

              <div className="profile-info">
                <span>EMAIL ADDRESS</span>
                <strong>arun@example.com</strong>
              </div>

              <div className="profile-info">
                <span>PHONE NUMBER</span>
                <strong>+91 98765 43210</strong>
              </div>

              <div className="profile-info">
                <span>DATE OF BIRTH</span>
                <strong>15 March 1998</strong>
              </div>

              <div className="profile-info">
                <span>GENDER</span>
                <strong>Male</strong>
              </div>

              <div className="profile-info">
                <span>ADDRESS</span>
                <strong>Coimbatore, Tamil Nadu</strong>
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="profile-section-card">
            <div className="profile-section-heading">
              <div className="section-icon work-icon">💼</div>
              <div>
                <h2>Work Information</h2>
                <p>Your employment details</p>
              </div>
            </div>

            <div className="profile-info-grid">
              <div className="profile-info">
                <span>EMPLOYEE ID</span>
                <strong>EMP001</strong>
              </div>

              <div className="profile-info">
                <span>DEPARTMENT</span>
                <strong>Engineering</strong>
              </div>

              <div className="profile-info">
                <span>DESIGNATION</span>
                <strong>Software Developer</strong>
              </div>

              <div className="profile-info">
                <span>JOINING DATE</span>
                <strong>10 January 2024</strong>
              </div>

              <div className="profile-info">
                <span>REPORTING MANAGER</span>
                <strong>Rajesh Kumar</strong>
              </div>

              <div className="profile-info">
                <span>WORK LOCATION</span>
                <strong>Coimbatore Office</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="profile-section-card account-section">
          <div className="profile-section-heading">
            <div className="section-icon account-icon">🔐</div>
            <div>
              <h2>Account Information</h2>
              <p>Your account and login details</p>
            </div>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info">
              <span>LOGIN ID</span>
              <strong>arun.kumar</strong>
            </div>

            <div className="profile-info">
              <span>ACCOUNT STATUS</span>
              <strong className="account-active">● Active</strong>
            </div>

            <div className="profile-info">
              <span>ROLE</span>
              <strong>Employee</strong>
            </div>

            <div className="profile-info">
              <span>LAST LOGIN</span>
              <strong>22 Aug 2026, 09:08 AM</strong>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;