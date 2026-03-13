import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, token, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    if (!token) {
        // Not logged in
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        // Logged in but wrong role
        console.warn(`Access denied. Required: ${requiredRole}, Current: ${user?.role}`);
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
