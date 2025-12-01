// src/components/RedirectWithSpinner.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

const RedirectWithSpinner = ({ isAuthenticated, role, authLoaded }) => {
  if (!authLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? `/${role}` : "/login"} replace />;
};

export default RedirectWithSpinner;
