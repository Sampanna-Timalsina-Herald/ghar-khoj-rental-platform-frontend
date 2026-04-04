import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import MaintenancePage from "../pages/MaintenancePage";
import api from "../api/axios";

const PublicRoute = ({ isAuthenticated, role }) => {
  const location = useLocation();
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
        console.warn('[PublicRoute] Failed to check maintenance mode:', error);
        setMaintenanceMode(false);
      } finally {
        setCheckingMaintenance(false);
      }
    };
    
    checkMaintenanceStatus();
  }, []);

  // Show loading while checking maintenance
  if (checkingMaintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Show maintenance page for non-admin users when maintenance mode is on
  // Allow login/register pages even during maintenance so admins can log in
  const isAuthPage = location.pathname === '/login' || 
                     location.pathname === '/register' ||
                     location.pathname === '/forgot-password' ||
                     location.pathname.startsWith('/reset-password');
  
  if (maintenanceMode && !isAuthPage && role !== 'admin') {
    return <MaintenancePage message={maintenanceMessage} />;
  }
  
  // Allow authenticated users to view listing details
  if (
    isAuthenticated &&
    (location.pathname.startsWith('/listing/') || location.pathname.startsWith('/payment/verify'))
  ) {
    return <Outlet />;
  }
  
  if (isAuthenticated) {
    return <Navigate to={`/${role}`} replace />;
  }
  return <Outlet />;
};

export default PublicRoute;
