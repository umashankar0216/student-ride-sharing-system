import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from './UI';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loader message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const Navigation = () => {
  const { isAuthenticated, logout, user } = useAuth();

  if (!isAuthenticated) return null;

  const isDashboardPage = window.location.pathname.includes('dashboard');

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <h2>🚗 RideShare</h2>
        </div>

        {isDashboardPage && (
          <div className="nav-menu">
            <span className="nav-user">
              {user?.role === 'ROLE_DRIVER' ? '🚙' : '👤'} {user?.email}
            </span>
            <button className="nav-logout" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
