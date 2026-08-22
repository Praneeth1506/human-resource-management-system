import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (loginId.trim() === "" || password.trim() === "") {
      setError("Please enter your email and password");
      return;
    }

    try {
      const res = await api.post("/login", {
        email: loginId.trim(),
        password: password,
      });

      const { access_token, must_reset_password } = res.data;
      localStorage.setItem("token", access_token);

      if (must_reset_password) {
        navigate("/reset-password");
        return;
      }

      const meRes = await api.get("/employees/me");
      const { role, id } = meRes.data;

      localStorage.setItem("role", role);
      localStorage.setItem("employee_id", id);

      navigate(role === "admin" ? "/admin/dashboard" : "/employee/dashboard");
    } catch (err) {
      if (err.response?.status === 401) {
        setError(err.response.data?.detail || "Invalid email or password");
      } else {
        setError("Unable to reach the server. Please try again.");
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-brand-section">
        <div className="brand-logo">
          <div className="brand-logo-icon">D</div>
          <span>Dayflow</span>
        </div>
        <div className="brand-content">
          <h1>Manage your work.<br />Simplify your day.</h1>
          <p>Dayflow helps you manage attendance, leave, payroll, and employee information in one place.</p>
          <div className="brand-features">
            <div><span>✓</span>Attendance Management</div>
            <div><span>✓</span>Leave Management</div>
            <div><span>✓</span>Payroll & Salary</div>
            <div><span>✓</span>Employee Dashboard</div>
          </div>
        </div>
        <p className="brand-footer">© 2026 Dayflow. All rights reserved.</p>
      </div>

      <div className="login-form-section">
        <div className="login-card">
          <div className="login-mobile-logo">
            <div className="brand-logo-icon">D</div>
            <span>Dayflow</span>
          </div>

          <h2>Welcome back</h2>
          <p className="login-subtitle">Enter your details to access your account.</p>

          <form onSubmit={handleLogin}>
            <label>Email</label>
            <input
              type="text"
              placeholder="Enter your email"
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

            {error && <p style={{ color: "#d33", fontSize: "0.85rem" }}>{error}</p>}

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button type="button" className="forgot-password" onClick={() => navigate("/reset-password")}>
                Forgot password?
              </button>
            </div>

            <button type="submit" className="login-button">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
