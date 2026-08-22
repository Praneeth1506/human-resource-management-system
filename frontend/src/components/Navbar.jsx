function Navbar() {
  const role = localStorage.getItem("role") || "Employee";

  return (
    <header style={styles.navbar}>
      <div>
        <h3 style={styles.title}>Dayflow HRMS</h3>
      </div>

      <div style={styles.right}>
        <button style={styles.iconBtn} aria-label="Notifications">
          🔔
        </button>

        <div style={styles.userInfo}>
          <div style={styles.avatarBadge}>AK</div>
          <div>
            <strong>Arun Kumar</strong>
            <p style={styles.role}>{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

const styles = {
  navbar: {
    height: "70px",
    padding: "0 25px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #e7e9eb",
    background: "#ffffff",
    boxSizing: "border-box",
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  iconBtn: {
    border: "none",
    background: "transparent",
    fontSize: "18px",
    cursor: "pointer",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatarBadge: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#113f38",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
  },
  role: {
    margin: 0,
    fontSize: "12px",
    color: "#64748b",
  },
};

export default Navbar;