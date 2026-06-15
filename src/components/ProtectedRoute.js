import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Guards a route. `roles` (optional) limits access to specific account types.
const ProtectedRoute = ({ roles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="route-loading">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
