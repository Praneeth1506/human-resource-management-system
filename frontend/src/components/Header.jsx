import "./Header.css";

function Header() {
  const role = localStorage.getItem("role");

  const userName = role === "admin" ? "Admin" : "Arun Kumar";
  const initials = role === "admin" ? "AD" : "AK";

  return (
    <header className="header">
      <div className="header-left">
        {/* Empty space for clean layout */}
      </div>

      <div className="header-right">
        <button className="notification-button" type="button">
          🔔
        </button>

        <div className="header-user">
          <div className="header-avatar">{initials}</div>

          <div className="header-user-info">
            <span className="header-user-name">{userName}</span>
            <span className="header-user-role">
              {role === "admin" ? "Administrator" : "Employee"}
            </span>
          </div>

          <span className="header-arrow">⌄</span>
        </div>
      </div>
    </header>
  );
}

export default Header;