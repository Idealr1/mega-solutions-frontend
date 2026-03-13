import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X, Check, FileText, Download, Building, User, MapPin, CheckCircle } from 'lucide-react';
import './AdminCommon.css';

const AdminB2BApplications = () => {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null); // For modal

    const [errorModal, setErrorModal] = useState({ show: false, message: '', details: '' });

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await api.get('/b2b/applications');
                setApplications(response.data.data || response.data || []);
            } catch (error) {
                console.error('Failed to fetch applications:', error);
                // Keep inline valid but show modal as well if critical
                const errorMsg = error.response?.data?.message || 'Failed to fetch applications from server.';
                const errorDetails = error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message;
                setErrorModal({ show: true, message: errorMsg, details: errorDetails });
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const [showPassword, setShowPassword] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [isResettingPassword, setIsResettingPassword] = useState(false);

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this application?`)) return;

        try {
            await api.post(`/b2b/applications/${id}/${action}`);

            setApplications(prev => prev.map(app => {
                if (app.id === id) {
                    let newStatus = app.status;
                    if (action === 'approve') newStatus = 'approved';
                    if (action === 'reject') newStatus = 'rejected';
                    if (action === 'freeze') newStatus = 'frozen';
                    if (action === 'unfreeze') newStatus = 'approved'; // Assuming unfreeze returns to active state
                    return { ...app, status: newStatus };
                }
                return app;
            }));

            if (action === 'approve') {
                alert(`Application Approved. The user has been activated.`);
            } else if (action === 'freeze') {
                alert('Account Frozen.');
            } else if (action === 'unfreeze') {
                alert('Account Unfrozen.');
            } else {
                alert('Application Rejected.');
            }

            if (action === 'reject' || action === 'freeze') {
                setSelectedApp(null);
            }
        } catch (error) {
            console.error(`Failed to ${action} application:`, error);
            const errorMsg = error.response?.data?.message || `Failed to ${action} application.`;
            const errorDetails = error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message;
            setErrorModal({ show: true, message: errorMsg, details: errorDetails });
        }
    };

    const handlePasswordReset = async (id) => {
        if (!passwordInput.trim()) {
            alert('Please enter a new password.');
            return;
        }

        try {
            await api.put(`/b2b/applications/${id}/password`, { password: passwordInput });
            alert('Password updated successfully.');
            setIsResettingPassword(false);
            setPasswordInput('');
        } catch (error) {
            console.error('Failed to update password:', error);
            alert('Failed to update password.');
        }
    };

    const fetchAppDetails = async (id) => {
        try {
            const response = await api.get(`/b2b/applications/${id}`);
            // Update selectedApp with full details including password if returned
            setSelectedApp(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to fetch application details:', error);
        }
    };

    const openDetails = (app) => {
        setSelectedApp(app);
    };

    const closeDetails = () => {
        setSelectedApp(null);
    };

    const closeErrorModal = () => {
        setErrorModal({ show: false, message: '', details: '' });
    };

    if (isLoading) return <div>Loading applications...</div>;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>B2B Applications</h1>
            </div>

            <div className="admin-table-container">
                {/* ... table content remains same ... */}
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Company</th>
                            <th>Type</th>
                            <th>Email</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.length > 0 ? (
                            applications.map(app => (
                                <tr key={app.id}>
                                    <td>{app.company_name || app.companyName}</td>
                                    <td>{app.user_type || app.userType}</td>
                                    <td>{app.email}</td>
                                    <td>{new Date(app.created_at || Date.now()).toLocaleDateString()}</td>
                                    <td><span className={`status-badge ${app.status.toLowerCase()}`}>{app.status}</span></td>
                                    <td>
                                        <button onClick={() => openDetails(app)} className="btn-action view">Review</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No applications found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Application Details Modal */}
            {selectedApp && (
                <div className="modal-overlay" onClick={closeDetails}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeDetails}><X size={24} /></button>

                        <div className="modal-header">
                            <h2>Application Details</h2>
                            <span className={`status-badge ${selectedApp.status.toLowerCase()}`}>{selectedApp.status.toUpperCase()}</span>
                        </div>

                        <div className="app-details-grid">
                            <div className="detail-section">
                                <h3><Building size={18} /> Company Information</h3>
                                <p><strong>Name:</strong> {selectedApp.company_name || selectedApp.companyName}</p>
                                <p><strong>Type:</strong> {selectedApp.user_type || selectedApp.userType}</p>
                                <p><strong>Address:</strong> {selectedApp.street_address || selectedApp.streetAddress}</p>
                                <p><strong>City/Country:</strong> {selectedApp.city}, {selectedApp.country}</p>
                            </div>

                            <div className="detail-section">
                                <h3><User size={18} /> Contact Information</h3>
                                <p><strong>Username:</strong> {selectedApp.username}</p>
                                <p><strong>Email:</strong> {selectedApp.email}</p>
                                <p><strong>Phone:</strong> {selectedApp.phone}</p>
                            </div>
                        </div>

                        <div className="detail-section full-width">
                            <h3><FileText size={18} /> Documents</h3>
                            {selectedApp.documents && selectedApp.documents.length > 0 ? (
                                <div className="documents-list">
                                    {selectedApp.documents.map((doc, idx) => {
                                        // Valid download URL
                                        // Backend Requirement: Send ABSOLUTE URLs.
                                        let downloadUrl = doc.url;

                                        // Fallback for legacy data/dev: If relative, assume api base without /api
                                        if (downloadUrl && !downloadUrl.startsWith('http')) {
                                            const apiRoot = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '');
                                            const suffix = downloadUrl.startsWith('/') ? downloadUrl : `/${downloadUrl}`;
                                            downloadUrl = `${apiRoot}${suffix}`;
                                        }

                                        return (
                                            <div key={idx} className="document-item">
                                                <FileText size={20} className="doc-icon" />
                                                <span className="doc-name">{doc.name}</span>
                                                <a
                                                    href={downloadUrl}
                                                    className="doc-download"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download
                                                >
                                                    <Download size={16} /> Download
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="no-docs">No documents uploaded.</p>
                            )}
                        </div>

                        {/* Credentials Display for Approved Users */}
                        {(selectedApp.status === 'approved' || selectedApp.status === 'frozen') && (
                            <div className="credentials-section">
                                <h3><CheckCircle size={18} /> Account Credentials</h3>
                                <div className="credentials-box">
                                    <div className="credential-row">
                                        <label>Username:</label>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <code>{selectedApp.username}</code>
                                        </div>
                                    </div>
                                    <div className="credential-row">
                                        <label>Password:</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <code>{showPassword ? (selectedApp.plain_password || '********') : '********'}</code>
                                            <button
                                                className="btn-text"
                                                onClick={() => {
                                                    if (!showPassword && !selectedApp.plain_password) {
                                                        // Fetch details if we don't have the password yet
                                                        fetchAppDetails(selectedApp.id);
                                                    }
                                                    setShowPassword(!showPassword);
                                                }}
                                            >
                                                {showPassword ? 'Hide' : 'Show'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="password-reset-section" style={{ marginTop: '15px' }}>
                                    {!isResettingPassword ? (
                                        <button className="btn-text" onClick={() => setIsResettingPassword(true)}>Change Password</button>
                                    ) : (
                                        <div className="reset-form" style={{ display: 'flex', gap: '10px' }}>
                                            <input
                                                type="text"
                                                placeholder="New Password"
                                                value={passwordInput}
                                                onChange={e => setPasswordInput(e.target.value)}
                                                className="admin-input-small"
                                            />
                                            <button className="btn-primary-small" onClick={() => handlePasswordReset(selectedApp.id)}>Update</button>
                                            <button className="btn-text" onClick={() => setIsResettingPassword(false)}>Cancel</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="modal-actions">
                            {selectedApp.status === 'pending' && (
                                <>
                                    <button onClick={() => handleAction(selectedApp.id, 'approve')} className="btn-primary approve-btn">
                                        <Check size={18} /> Approve & Activate
                                    </button>
                                    <button onClick={() => handleAction(selectedApp.id, 'reject')} className="btn-secondary reject-btn">
                                        <X size={18} /> Reject
                                    </button>
                                </>
                            )}

                            {selectedApp.status === 'approved' && (
                                <button onClick={() => handleAction(selectedApp.id, 'freeze')} className="btn-warning freeze-btn" style={{ backgroundColor: '#ffc107', color: '#000' }}>
                                    Pause Account (Freeze)
                                </button>
                            )}

                            {selectedApp.status === 'frozen' && (
                                <button onClick={() => handleAction(selectedApp.id, 'unfreeze')} className="btn-primary approve-btn">
                                    <Check size={18} /> Reactivate Account
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            )}

            {/* Error Modal */}
            {errorModal.show && (
                <div className="modal-overlay" onClick={closeErrorModal}>
                    <div className="modal-content error-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeErrorModal}><X size={24} /></button>
                        <div className="modal-header error-header-modal">
                            <h2>Error Occurred</h2>
                        </div>
                        <div className="error-body">
                            <div className="error-alert">
                                <p>{errorModal.message}</p>
                            </div>
                            {errorModal.details && (
                                <details className="error-details">
                                    <summary>View Technical Details</summary>
                                    <pre>{errorModal.details}</pre>
                                </details>
                            )}
                        </div>
                        <div className="modal-actions center">
                            <button className="btn-secondary" onClick={closeErrorModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminB2BApplications;
