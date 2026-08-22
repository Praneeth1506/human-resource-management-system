import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // No token or role stored - not logged in (presence-of-token check only,
  // not a real server-side verification - see time constraints)
  if (!token || !userRole) {
    return <Navigate to="/login" replace />;
  }

  // User does not have the correct role
  if (role && userRole !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;