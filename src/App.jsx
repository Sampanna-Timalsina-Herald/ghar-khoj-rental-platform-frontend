import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Pages
import Home from './pages/Home';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OTPVerificationPage from './pages/auth/OTPVerificationPage';

// Dashboards
import AdminDashboard from './pages/admin/Dashboard';
import LandlordDashboard from './pages/landlord/Dashboard';
import TenantDashboard from './pages/tenant/Dashboard';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  const { loadFromStorage, isAuthenticated, role } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OTPVerificationPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          {role === 'admin' && <Route path="/admin/*" element={<AdminDashboard />} />}
          {role === 'landlord' && <Route path="/landlord/*" element={<LandlordDashboard />} />}
          {role === 'tenant' && <Route path="/tenant/*" element={<TenantDashboard />} />}
        </Route>

        {/* Default / Redirect */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? `/${role}` : '/login'} replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
