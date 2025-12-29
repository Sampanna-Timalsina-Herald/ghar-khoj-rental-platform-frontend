// // App.jsx
// import React, { useEffect } from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import { useAuthStore } from "./stores/authStore";

// // Pages
// import Home from "./pages/Home";
// import LoginPage from "./pages/auth/LoginPage";
// import RegisterPage from "./pages/auth/RegisterPage";
// //import OTPVerificationPage from "./pages/auth/OTPVerificationPage";
// import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
// import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// // Dashboards
// import AdminDashboard from "./pages/admin/Dashboard";
// import LandlordDashboard from "./pages/landlord/Dashboard";
// import TenantDashboard from "./pages/tenant/Dashboard";

// // Components
// import PublicRoute from "./components/PublicRoute";
// import ProtectedRoute from "./components/ProtectedRoute";
// import RedirectWithSpinner from "./components/RedirectWithSpinner";

// function App() {
//   const { loadFromStorage, isAuthenticated, role, authLoaded } = useAuthStore();

//   useEffect(() => {
//     loadFromStorage(); // Load token and role from localStorage
//   }, []);

//   return (
//     <Router>
//       <Routes>
//         {/* Public Routes */}
//         <Route
//           element={
//             <PublicRoute
//               isAuthenticated={isAuthenticated}
//               role={role}
//               authLoaded={authLoaded}
//             />
//           }
//         >
//           <Route path="/home" element={<Home />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//           <Route path="/forgot-password" element={<ForgotPasswordPage />} />
//           <Route path="/reset-password" element={<ResetPasswordPage />}/>
//         </Route>

//         {/* Protected Routes */}
//         <Route
//           element={
//             <ProtectedRoute
//               isAuthenticated={isAuthenticated}
//               authLoaded={authLoaded}
//             />
//           }
//         >
//           <Route
//             path="/admin/*"
//             element={
//               role === "admin" ? <AdminDashboard /> : <Navigate to="/" replace />
//             }
//           />
//           <Route
//             path="/landlord/*"
//             element={
//               role === "landlord" ? <LandlordDashboard /> : <Navigate to="/" replace />
//             }
//           />
//           <Route
//             path="/tenant/*"
//             element={
//               role === "tenant" ? <TenantDashboard /> : <Navigate to="/" replace />
//             }
//           />
//         </Route>

//         {/* Default redirect */}
//         <Route
//           path="/"
//           element={
//             <RedirectWithSpinner
//               isAuthenticated={isAuthenticated}
//               role={role}
//               authLoaded={authLoaded}
//             />
//           }
//         />

//         {/* Catch-all route */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { initSocket, disconnectSocket } from "./services/socket";

// Pages
import Home from "./pages/Home";
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
  const { loadFromStorage, isAuthenticated, role, accessToken } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Initialize socket when user logs in
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      console.log('[App] User authenticated, initializing socket');
      initSocket(accessToken);
    } else {
      // Disconnect socket when user logs out
      disconnectSocket();
    }
  }, [isAuthenticated, accessToken]);

  return (
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
  );
}

export default App;
