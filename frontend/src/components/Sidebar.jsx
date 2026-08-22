import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">HRMS</div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
          Dashboard
        </NavLink>
        <NavLink to="/payroll" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
          Payroll
        </NavLink>
      </nav>
    </aside>
  );
}