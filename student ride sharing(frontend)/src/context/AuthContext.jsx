import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register({
        userName: userData.username,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'STUDENT', // Include role in registration
      });
            
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login({
        userNameOrEmail: credentials.userNameOrEmail,
        password: credentials.password,
      });

      const newToken = response.accessToken;
      
      // Store token and create basic user object
      localStorage.setItem('token', newToken);
      const userObj = {
        email: credentials.userNameOrEmail,
        role: credentials.role || 'ROLE_STUDENT', // Default role
      };
      localStorage.setItem('user', JSON.stringify(userObj));

      setToken(newToken);
      setUser(userObj);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const updateUserRole = (role) => {
    const updatedUser = { ...user, role };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = !!token && !!user;
  const isDriver = user?.role === 'ROLE_DRIVER';
  const isStudent = user?.role === 'ROLE_STUDENT' || !user?.role;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated,
        isDriver,
        isStudent,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
