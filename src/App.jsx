import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { initSocket, disconnectSocket } from "./services/socket";
import { ToastProvider } from "./context/ToastContext";
import { startTokenRefresh, stopTokenRefresh } from "./utils/tokenRefresh";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Search from "./pages/Search";
import ListingDetail from "./pages/ListingDetail";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ListProperty from "./pages/ListProperty";

// Dashboards
import AdminDashboard from "./pages/admin/Dashboard";
import LandlordDashboard from "./pages/landlord/Dashboard";
import TenantDashboard from "./pages/tenant/Dashboard";
import TenantListingDetail from "./pages/tenant/TenantListingDetail";

// Components
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { loadFromStorage, isAuthenticated, role, accessToken, authLoaded } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Initialize socket when user logs in
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      console.log('[App] User authenticated, initializing socket');
      initSocket(accessToken);
      
      // Start automatic token refresh
      console.log('[App] Starting automatic token refresh');
      startTokenRefresh();
    } else {
      // Disconnect socket when user logs out
      disconnectSocket();
      
      // Stop token refresh when user logs out
      stopTokenRefresh();
    }
    
    // Cleanup on unmount
    return () => {
      stopTokenRefresh();
    };
  }, [isAuthenticated, accessToken]);

  // Show loading spinner while auth is loading
  if (!authLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <Router>
        <Routes>

        {/* Tenant listing detail - should show before public routes check */}
        <Route 
          path="/tenant/listing/:id" 
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              allowedRoles={["tenant"]}
              userRole={role}
            />
          }
        >
          <Route path="" element={<TenantListingDetail />} />
        </Route>

        {/* ---------------- PUBLIC ROUTES ---------------- */}
        <Route
          element={
            <PublicRoute
              isAuthenticated={isAuthenticated}
              role={role}
            />
          }
        >
          <Route path= "/list-property" element={<ListProperty />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<Search />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* ---------------- ADMIN ROUTES ---------------- */}
        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              allowedRoles={["admin"]}
              userRole={role}
            />
          }
        >
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>

        {/* ---------------- LANDLORD ROUTES ---------------- */}
        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              allowedRoles={["landlord"]}
              userRole={role}
            />
          }
        >
          <Route path="/landlord/*" element={<LandlordDashboard />} />
        </Route>

        {/* ---------------- TENANT ROUTES ---------------- */}
        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              allowedRoles={["tenant"]}
              userRole={role}
            />
          }
        >
          <Route path="/tenant/*" element={<TenantDashboard />} />
        </Route>

        {/* ---------------- FALLBACK ---------------- */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
