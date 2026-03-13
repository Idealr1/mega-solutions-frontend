import React, { useState } from 'react';
import './RegisterPage.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const { register, error, isLoading } = useAuth();
    const navigate = useNavigate();
    const [localError, setLocalError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (formData.password !== formData.password_confirmation) {
            setLocalError('Passwords do not match');
            return;
        }

        const success = await register(formData);
        if (success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                {/* Left Side (Black, 40%) */}
                <div className="register-left">
                    <p className="register-left-text">
                        Adipiscing elit, sed do eiusmod tempor<br />incididunt ut labore et dolore
                    </p>

                    <div className="register-left-buttons">
                        <button className="register-btn-grey" onClick={() => navigate('/login')}>Login</button>
                        <button className="register-btn-blue">Signup</button>
                    </div>
                </div>

                {/* Right Side (White, 60%) */}
                <div className="register-right">
                    <h1 className="register-title">Sign Up</h1>
                    <p className="register-subtitle">
                        Already have an account? <Link to="/login">Login.</Link>
                    </p>

                    {(error || localError) && (
                        <div className="register-error-message" style={{
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

                    <form className="register-form" onSubmit={handleSubmit}>
                        <div className="register-input-group">
                            <label>Full Name*</label>
                            <input
                                type="text"
                                name="name"
                                className="register-input"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="register-input-group">
                            <label>Email Address*</label>
                            <input
                                type="email"
                                name="email"
                                className="register-input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="register-input-group">
                            <label>Password*</label>
                            <input
                                type="password"
                                name="password"
                                className="register-input"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Minimum 8 characters"
                                required
                                minLength="8"
                            />
                        </div>

                        <div className="register-input-group">
                            <label>Confirm Password*</label>
                            <input
                                type="password"
                                name="password_confirmation"
                                className="register-input"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                required
                                minLength="8"
                            />
                        </div>

                        <button type="submit" className="register-submit-btn" disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>

                    <p className="register-footer-text">
                        By signing up, you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
