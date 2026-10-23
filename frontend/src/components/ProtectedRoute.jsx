import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9fe]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-lavender-600 animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Verifying MindBridge session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role) && user.role !== 'admin') {
    // If student tries to visit admin/counsellor or vice-versa
    if (user.role === 'counsellor') {
      return <Navigate to="/counsellor/dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};
