
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navigation, ProtectedRoute } from './components/Navigation';
import { Login, Register } from './pages/Auth';
import { StudentDashboard } from './pages/StudentDashboard';
// 🟢 SYNCHRONIZED: Points to your proper .jsx file location 
import { DriverDashboard, DriverRides } from './pages/DriverDashboard'; 
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="app">
          <Navigation />
          <div className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Driver Routes */}
              <Route
                path="/driver/dashboard"
                element={
                  <ProtectedRoute>
                    <DriverDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Standalone Route for Direct Rides Navigation Link */}
              <Route
                path="/driver/rides"
                element={
                  <ProtectedRoute>
                    <DriverRides />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Catch-all Redirects */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;