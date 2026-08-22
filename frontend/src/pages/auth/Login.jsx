import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (loginId.trim() === "" || password.trim() === "") {
      alert("Please enter Login ID and Password");
      return;
    }

    // Temporary frontend login
    // Backend API will replace this later
    if (loginId.toLowerCase().includes("admin")) {
      localStorage.setItem("role", "admin");
      navigate("/admin/dashboard");
    } else {
      localStorage.setItem("role", "employee");
      navigate("/employee/dashboard");
    }
  };

  return (
    <div className="login-page">
      {/* Left Side */}
      <div className="login-brand-section">
        <div className="brand-logo">
          <div className="brand-logo-icon">D</div>
          <span>Dayflow</span>
        </div>

        <div className="brand-content">
          <h1>Manage your work.<br />Simplify your day.</h1>

          <p>
            Dayflow helps you manage attendance, leave,
            payroll, and employee information in one place.
          </p>

          <div className="brand-features">
            <div>
              <span>✓</span>
              Attendance Management
            </div>

            <div>
              <span>✓</span>
              Leave Management
            </div>

            <div>
              <span>✓</span>
              Payroll & Salary
            </div>

            <div>
              <span>✓</span>
              Employee Dashboard
            </div>
          </div>
        </div>

        <p className="brand-footer">
          © 2026 Dayflow. All rights reserved.
        </p>
      </div>

      {/* Right Side */}
      <div className="login-form-section">
        <div className="login-card">
          <div className="login-mobile-logo">
            <div className="brand-logo-icon">D</div>
            <span>Dayflow</span>
          </div>

          <h2>Welcome back</h2>
          <p className="login-subtitle">
            Enter your details to access your account.
          </p>

          <form onSubmit={handleLogin}>
            <label>Login ID</label>

            <input
              type="text"
              placeholder="Enter your Login ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={() => navigate("/reset-password")}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="login-button">
              Login
            </button>
          </form>

          <div className="demo-login">
            <strong>Demo Login</strong>
            <p>
              Enter <b>admin</b> in Login ID for Admin access.
              <br />
              Any other Login ID opens Employee access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;