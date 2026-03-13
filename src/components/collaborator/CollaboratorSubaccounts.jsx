import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Plus, UserPlus, Loader, X, Shield, Mail, Lock, User as UserIcon } from 'lucide-react';
import './CollaboratorSubaccounts.css';

const PERMISSIONS = [
    { key: 'manage_subaccounts', label: 'Manage Subaccounts' },
    { key: 'view_billing', label: 'View Billing & Wallet' },
    { key: 'submit_quotes', label: 'Submit Quotes' },
    { key: 'place_orders', label: 'Place Orders' },
    { key: 'manage_claims', label: 'Manage Claims' }
];

const CollaboratorSubaccounts = () => {
    const [subaccounts, setSubaccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        permissions: []
    });

    useEffect(() => {
        fetchSubaccounts();
    }, []);

    const fetchSubaccounts = async () => {
        try {
            const response = await api.get('/collaborators/subaccounts');
            setSubaccounts(response.data.data || response.data || []);
        } catch (err) {
            console.error("Failed to fetch subaccounts", err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePermissionToggle = (permKey) => {
        setFormData(prev => {
            const newPermissions = prev.permissions.includes(permKey)
                ? prev.permissions.filter(k => k !== permKey)
                : [...prev.permissions, permKey];
            return { ...prev, permissions: newPermissions };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        if (formData.password !== formData.password_confirmation) {
            setError("Passwords do not match");
            setSaving(false);
            return;
        }

        try {
            await api.post('/collaborators/subaccounts', formData);
            setShowModal(false);
            setFormData({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                permissions: []
            });
            fetchSubaccounts(); // Refresh list
        } catch (err) {
            console.error("Failed to create subaccount", err);
            setError(err.response?.data?.message || "Failed to create subaccount. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="admin-loading-state" style={{ padding: '100px', textAlign: 'center' }}>
            <Loader className="spin" size={32} />
            <p style={{ marginTop: '15px' }}>Loading subaccounts...</p>
        </div>
    );

    return (
        <div className="collaborator-subaccounts">
            <div className="subaccounts-header">
                <div>
                    <h2>Subaccounts</h2>
                    <p style={{ color: '#666' }}>Manage team members and their access levels.</p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <UserPlus size={18} /> Add Subaccount
                </button>
            </div>

            <div className="subaccounts-list-container">
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Permissions</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subaccounts.length > 0 ? (
                            subaccounts.map(sub => (
                                <tr key={sub.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#666' }}>
                                                <UserIcon size={16} />
                                            </div>
                                            <span style={{ fontWeight: '500' }}>{sub.name}</span>
                                        </div>
                                    </td>
                                    <td>{sub.email}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            {(sub.permissions || []).map(p => (
                                                <span key={p} className="status-badge" style={{ fontSize: '10px', background: '#f3f4f6', color: '#666' }}>
                                                    {p.replace('_', ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td><span className="status-badge approved">Active</span></td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn-sm" style={{ padding: '4px 8px', fontSize: '12px' }}>Edit</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '60px' }}>
                                    <Users size={48} style={{ opacity: 0.2, marginBottom: '15px' }} />
                                    <p style={{ color: '#666' }}>No subaccounts found. Create your first team member!</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={() => setShowModal(false)}>
                            <X size={20} />
                        </button>
                        <div className="modal-header">
                            <h2>Create New Subaccount</h2>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <form onSubmit={handleSubmit} className="subaccount-form">
                            <div className="form-group">
                                <label><UserIcon size={14} style={{ marginRight: '5px' }} /> Full Name*</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. John Doe"
                                    className="modern-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label><Mail size={14} style={{ marginRight: '5px' }} /> Email Address*</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="john@example.com"
                                    className="modern-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label><Lock size={14} style={{ marginRight: '5px' }} /> Password*</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Min 8 characters"
                                    className="modern-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm Password*</label>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleInputChange}
                                    placeholder="Repeat password"
                                    className="modern-input"
                                    required
                                />
                            </div>

                            <div className="permissions-section">
                                <h4><Shield size={14} style={{ marginRight: '5px' }} /> Permissions</h4>
                                <div className="permissions-grid">
                                    {PERMISSIONS.map(perm => (
                                        <label key={perm.key} className="permission-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions.includes(perm.key)}
                                                onChange={() => handlePermissionToggle(perm.key)}
                                            />
                                            <span>{perm.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? <><Loader className="spin" size={18} /> Creating...</> : 'Create Subaccount'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollaboratorSubaccounts;
