import Sidebar from "./Sidebar";
import Header from "./Header";
import "./Layout.css";

function Layout({ children, role = "employee" }) {
  return (
    <div className="app-layout">
      <Sidebar role={role} />

      <div className="layout-main">
        <Header />

        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;