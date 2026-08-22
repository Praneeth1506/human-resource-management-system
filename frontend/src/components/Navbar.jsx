import { Bell, UserCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user } = useAuth();

  return (
    <header style={styles.navbar}>
      <div>
        <h3 style={styles.title}>Human Resource Management System</h3>
      </div>

      <div style={styles.right}>
        <Bell size={22} />

        <div style={styles.userInfo}>
          <UserCircle size={28} />
          <div>
            <strong>{user?.name}</strong>
            <p style={styles.role}>{user?.role}</p>
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
    borderBottom: "1px solid #ddd",
    boxSizing: "border-box",
  },

  title: {
    margin: 0,
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: "25px",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  role: {
    margin: 0,
    fontSize: "12px",
  },
};

export default Navbar;