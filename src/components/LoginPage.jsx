import React, { useState } from 'react';
import './LoginPage.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, isLoading } = useAuth();
    const navigate = useNavigate();
    const [localError, setLocalError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        console.log('[LoginPage] Submit triggered');
        console.log('[LoginPage] Credentials:', { email, password });

        if (!email || !password) {
            setLocalError('Please fill in all fields');
            return;
        }

        console.log('[LoginPage] Calling auth.login...');
        const user = await login(email, password);
        console.log('[LoginPage] Auth.login returned:', user);

        if (user) {
            console.log('[LoginPage] Login success. User role:', user.role);

            if (user.role === 'admin') {
                console.log('[LoginPage] Redirecting to /admin');
                navigate('/admin');
            } else if (user.role === 'collaborator') {
                console.log('[LoginPage] Redirecting to /collaborator');
                navigate('/collaborator');
            } else {
                console.log('[LoginPage] Redirecting to /dashboard');
                navigate('/dashboard'); // Or '/' if preferred
            }
        } else {
            console.error('[LoginPage] Login returned null/false');
            // The AuthContext sets its own 'error' state, but we can double check
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Left Side (Black, 40%) */}
                <div className="login-left">
                    <p className="login-left-text">
                        Adipiscing elit, sed do eiusmod tempor<br />incididunt ut labore et dolore
                    </p>

                    <div className="login-left-buttons">
                        <button className="login-btn-blue">Login with email</button>
                        <button className="login-btn-grey" onClick={() => navigate('/signup')}>Signup</button>
                    </div>
                </div>

                {/* Right Side (White, 60%) */}
                <div className="login-right">
                    <h1 className="login-title">Login</h1>
                    <p className="login-subtitle">
                        Don't have an account? <Link to="/signup">Sign Up.</Link>
                    </p>

                    {(error || localError) && (
                        <div className="login-error-message" style={{
                            backgroundColor: '#ffebee',
                            color: '#c62828',
                            padding: '10px 15px',
                            borderRadius: '4px',
                            marginBottom: '20px',
                            width: '100%',
                            maxWidth: '675px',
                            border: '1px solid #ef9a9a'
                        }}>
                            {localError || error}
                        </div>
                    )}

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="login-input-group">
                            <label>Username*</label>
                            <input
                                type="text"
                                className="login-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="login-input-group">
                            <label>Password*</label>
                            <input
                                type="password"
                                className="login-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="login-options">
                            <label className="login-checkbox">
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                                Remember me
                            </label>
                            <Link to="/forgot-password" className="login-forgot-link">Forgot password?</Link>
                        </div>

                        <button type="submit" className="login-submit-btn" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
