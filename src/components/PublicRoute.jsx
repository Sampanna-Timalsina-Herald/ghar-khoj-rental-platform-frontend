// import React from "react";             // ✅ Add this
// import { Navigate, Outlet } from "react-router-dom";

// const PublicRoute = ({ isAuthenticated }) => {
//   return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
// };

// export default PublicRoute;
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = ({ isAuthenticated, role }) => {
  if (isAuthenticated) {
    return <Navigate to={`/${role}`} replace />;
  }
  return <Outlet />;
};

export default PublicRoute;
