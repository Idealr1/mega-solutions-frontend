import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Set default auth header
    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete api.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    }, [token]);

    // Check auth on mount
    useEffect(() => {
        const checkAuth = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await api.get('/auth/me');
                setUser(response.data.user || response.data); // Adjust based on actual API response structure
            } catch (err) {
                console.error('Auth check failed:', err);
                logout();
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []); // Run once on mount

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user, token } = response.data;

            setToken(token);
            setUser(user);
            return user; // Return user to allow component to check role
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            // Optional: Call logout endpoint if exists
            // await api.post('/auth/logout'); 
        } catch (err) {
            // ignore
        } finally {
            setToken(null);
            setUser(null);
        }
    };

    const register = async (userData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/register', userData);
            // Assuming register auto-logs in or returns token
            if (response.data.token) {
                setToken(response.data.token);
                setUser(response.data.user);
            }
            return true;
        } catch (err) {
            console.error('Registration failed:', err);
            setError(err.response?.data?.message || 'Registration failed.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, token, login, logout, register, isLoading, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
