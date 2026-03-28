// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";

// const ProtectedRoute = ({ isAuthenticated, allowedRoles, userRole }) => {
//   if (!isAuthenticated) return <Navigate to="/login" replace />;
//   if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" replace />;
//   return <Outlet />;
// };

// export default ProtectedRoute;
import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import LocationSetupModal from "./LocationSetupModal";
import { useLocationStore } from "../stores/locationStore";

const ProtectedRoute = ({ isAuthenticated, allowedRoles, userRole }) => {
  const { fetchStatus, statusLoaded, statusLoading, hasLocation } = useLocationStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchStatus();
    }
  }, [isAuthenticated, fetchStatus]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" replace />;

  if (statusLoading && !statusLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (statusLoaded && !hasLocation) {
    return (
      <>
        <LocationSetupModal
          isOpen={true}
          force={true}
          onCompleted={() => {
            // refresh status after saving
            fetchStatus();
          }}
        />
        {/* Prevent underlying content access until location is saved */}
      </>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
