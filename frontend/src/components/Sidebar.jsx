import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ role }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">D</div>
        <span>Dayflow</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-menu">
        {role === "employee" ? (
          <>
            <NavLink
              to="/employee/dashboard"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="sidebar-icon">⌂</span>
              Dashboard
            </NavLink>

            <NavLink
              to="/attendance"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="sidebar-icon">◷</span>
              Attendance
            </NavLink>

            <NavLink
              to="/leave"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="sidebar-icon">▣</span>
              Leave
            </NavLink>

            <NavLink
              to="/payroll"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="sidebar-icon">▤</span>
              Payroll
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="sidebar-icon">♙</span>
              Profile
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="sidebar-icon">⌂</span>
              Dashboard
            </NavLink>

            <NavLink
              to="/admin/employees"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="sidebar-icon">♙</span>
              Employees
            </NavLink>

            <NavLink
              to="/admin/leave"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="sidebar-icon">▣</span>
              Leave Requests
            </NavLink>
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <button className="logout-button" onClick={logout}>
          <span>↪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;