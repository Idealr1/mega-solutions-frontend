import React, { useState } from 'react';
import api from '../services/api';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import './B2BPage.css';

const B2BPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        phone: '',
        userType: '',
        companyName: '',
        streetAddress: '',
        addressLine2: '',
        country: '',
        city: '',
        postcode: ''
    });

    const [files, setFiles] = useState([]);
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        setMessage('');

        const data = new FormData();
        // Append text fields
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        // Append files
        files.forEach(file => {
            data.append('documents[]', file);
        });

        try {
            await api.post('/b2b/applications', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setStatus('success');
            setMessage('Your application has been submitted successfully! We will review your details and documents. Once approved, you will receive your login credentials via email.');
            setFormData({
                username: '', password: '', email: '', phone: '',
                userType: '', companyName: '', streetAddress: '', addressLine2: '',
                country: '', city: '', postcode: ''
            });
            setFiles([]);
        } catch (error) {
            console.error(error);
            setStatus('error');
            // Extract detailed error message
            const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'There was an error submitting your application.';
            const errorDetails = error.response?.data?.errors ? JSON.stringify(error.response.data.errors, null, 2) : '';
            setMessage(errorDetails ? `${errorMsg}\n${errorDetails}` : errorMsg);
        }
    };

    // Simplified Success Modal Rendering - overlaying the form
    const SuccessModal = () => (
        <div className="modal-overlay">
            <div className="modal-content-success">
                <div className="success-icon-wrapper">
                    <CheckCircle size={48} color="#4CAF50" />
                </div>
                <h2>Application Received!</h2>
                <p>{message}</p>
                <button className="btn-success-close" onClick={() => setStatus('idle')}>Close</button>
            </div>
        </div>
    );

    return (
        <div className="b2b-page">
            <div className="b2b-header">
                <h1>B2B <strong>Registration</strong></h1>
                <p>Apply for a professional account to access exclusive trade pricing and resources.</p>
            </div>

            <div className="b2b-container">
                {/* Left Side: Contact Details (White Form) */}
                <div className="b2b-left">
                    <h2 className="b2b-section-title dark">Contact Details</h2>

                    <div className="b2b-form-section">
                        <div className="b2b-input-group">
                            <label>Username*</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="b2b-input light-mode"
                                required
                            />
                        </div>
                        <div className="b2b-input-group">
                            <label>Password*</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="b2b-input light-mode"
                                required
                            />
                        </div>
                        <div className="b2b-input-group">
                            <label>Email*</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="b2b-input light-mode"
                                required
                            />
                        </div>
                        <div className="b2b-input-group">
                            <label>Phone Number*</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="b2b-input light-mode"
                                required
                            />
                        </div>
                    </div>

                    <div className="b2b-upload-section">
                        <h3>Required Documents</h3>
                        <p>Please upload your Business License, Tax certificate, or other relevant documents.</p>

                        <div className="file-upload-wrapper">
                            <input
                                type="file"
                                id="file-upload"
                                multiple
                                onChange={handleFileChange}
                                className="hidden-input"
                            />
                            <label htmlFor="file-upload" className="upload-box">
                                <Upload size={24} />
                                <span>Click to Upload Documents</span>
                            </label>
                        </div>

                        {files.length > 0 && (
                            <ul className="file-list">
                                {files.map((file, index) => (
                                    <li key={index}>
                                        <span className="file-name">{file.name}</span>
                                        <button type="button" onClick={() => removeFile(index)} className="remove-file">×</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Right Side: General Information (Black Form) */}
                <div className="b2b-right">
                    <h2 className="b2b-section-title light">General Information</h2>

                    <form onSubmit={handleSubmit} className="b2b-form">
                        <div className="b2b-row">
                            <div className="b2b-input-group icon-arrow">
                                <label>User Type*</label>
                                <select
                                    name="userType"
                                    value={formData.userType}
                                    onChange={handleChange}
                                    className="b2b-input dark-mode"
                                    required
                                >
                                    <option value="">Select Type</option>
                                    <option value="contractor">Contractor</option>
                                    <option value="designer">Designer</option>
                                    <option value="architect">Architect</option>
                                    <option value="retailer">Retailer</option>
                                </select>
                            </div>
                            <div className="b2b-input-group">
                                <label>Company Name*</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="b2b-input dark-mode"
                                    required
                                />
                            </div>
                        </div>

                        <div className="b2b-row">
                            <div className="b2b-input-group">
                                <label>Street Address*</label>
                                <input
                                    type="text"
                                    name="streetAddress"
                                    value={formData.streetAddress}
                                    onChange={handleChange}
                                    className="b2b-input dark-mode"
                                    required
                                />
                            </div>
                            <div className="b2b-input-group">
                                <label>Address Line 2</label>
                                <input
                                    type="text"
                                    name="addressLine2"
                                    value={formData.addressLine2}
                                    onChange={handleChange}
                                    className="b2b-input dark-mode"
                                />
                            </div>
                        </div>

                        <div className="b2b-row">
                            <div className="b2b-input-group icon-arrow">
                                <label>Country*</label>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="b2b-input dark-mode"
                                    required
                                >
                                    <option value="">Select Country</option>
                                    <option value="United States">United States</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                    <option value="Canada">Canada</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="b2b-input-group">
                                <label>State / Province*</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state || ''}
                                    onChange={handleChange}
                                    className="b2b-input dark-mode"
                                    placeholder="e.g. New York"
                                    required
                                />
                            </div>
                        </div>

                        <div className="b2b-row">
                            <div className="b2b-input-group">
                                <label>Town / City*</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="b2b-input dark-mode"
                                    required
                                />
                            </div>
                            <div className="b2b-input-group">
                                <label>Postcode / ZIP*</label>
                                <input
                                    type="text"
                                    name="postcode"
                                    value={formData.postcode}
                                    onChange={handleChange}
                                    className="b2b-input dark-mode"
                                    required
                                />
                            </div>
                        </div>

                        {status === 'error' && (
                            <div className="error-card">
                                <div className="error-header">
                                    <AlertCircle size={20} />
                                    <h3>Submission Failed</h3>
                                </div>
                                <pre className="error-content">{message}</pre>
                            </div>
                        )}

                        <button type="submit" className="b2b-register-btn" disabled={status === 'submitting'}>
                            {status === 'submitting' ? 'Submitting...' : 'Register Application'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Success Modal Overlay */}
            {status === 'success' && <SuccessModal />}
        </div>
    );
};

export default B2BPage;
