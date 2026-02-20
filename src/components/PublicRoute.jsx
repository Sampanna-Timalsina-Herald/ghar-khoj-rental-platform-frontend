// import React from "react";             // ✅ Add this
// import { Navigate, Outlet } from "react-router-dom";

// const PublicRoute = ({ isAuthenticated }) => {
//   return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
// };

// export default PublicRoute;
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const PublicRoute = ({ isAuthenticated, role }) => {
  const location = useLocation();
  
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
