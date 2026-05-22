import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import LocationSetupModal from "./LocationSetupModal";
import { useLocationStore } from "../stores/locationStore";
import MaintenancePage from "../pages/MaintenancePage";
import api from "../api/axios";

const ProtectedRoute = ({ isAuthenticated, allowedRoles, userRole }) => {
  const { fetchStatus, statusLoaded, statusLoading, hasLocation } = useLocationStore();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);

  // Check maintenance mode on mount
  useEffect(() => {
    const checkMaintenanceStatus = async () => {
      try {
        const response = await api.get('/public/maintenance');
        if (response.data.success) {
          setMaintenanceMode(response.data.data.maintenanceMode);
          setMaintenanceMessage(response.data.data.message || 'Site is under maintenance. Please try again later.');
        }
      } catch (error) {
        console.warn('[ProtectedRoute] Failed to check maintenance mode:', error);
        setMaintenanceMode(false);
      } finally {
        setCheckingMaintenance(false);
      }
    };
    
    checkMaintenanceStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('[PROTECTED-ROUTE] Fetching location status for role:', userRole);
      fetchStatus();
    }
  }, [isAuthenticated, fetchStatus]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" replace />;

  // Show loading while checking maintenance
  if (checkingMaintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Show maintenance page for non-admin users when maintenance mode is on
  if (maintenanceMode && userRole !== 'admin') {
    return <MaintenancePage message={maintenanceMessage} />;
  }

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
