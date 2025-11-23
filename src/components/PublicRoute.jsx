import React from "react";             // ✅ Add this
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = ({ isAuthenticated }) => {
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default PublicRoute;
