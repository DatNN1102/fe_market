// src/components/RequireAuth.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface RequireAuthProps {
  allowedRoles: string[];
}

const RequireAuth: React.FC<RequireAuthProps> = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // 'user' | 'admin'
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(role || '')) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
