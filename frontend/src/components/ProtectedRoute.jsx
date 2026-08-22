import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const userRole = localStorage.getItem("role");

  // User is not logged in
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // User does not have the correct role
  if (role && userRole !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;