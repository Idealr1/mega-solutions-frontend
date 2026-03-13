import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    MapPin,
    Plus,
    Home,
    Truck,
    CreditCard,
    CheckCircle,
    Edit2,
    Trash2,
    Loader,
    X,
    MoreVertical,
    Star
} from 'lucide-react';
import './CollaboratorAddresses.css';

const CollaboratorAddresses = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        type: 'shipping',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        zip: '',
        country: 'USA',
        is_default: false
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await api.get('/addresses');
            setAddresses(response.data.data || response.data || []);
        } catch (error) {
            console.error("Failed to fetch addresses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (address = null) => {
        if (address) {
            setEditingAddress(address);
            setFormData({
                type: address.type,
                address_line1: address.address_line1,
                address_line2: address.address_line2 || '',
                city: address.city,
                state: address.state,
                zip: address.zip,
                country: address.country || 'USA',
                is_default: address.is_default || false
            });
        } else {
            setEditingAddress(null);
            setFormData({
                type: 'shipping',
                address_line1: '',
                address_line2: '',
                city: '',
                state: '',
                zip: '',
                country: 'USA',
                is_default: false
            });
        }
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if (editingAddress) {
                await api.put(`/addresses/${editingAddress.id}`, formData);
            } else {
                await api.post('/addresses', formData);
            }
            setShowModal(false);
            fetchAddresses();
        } catch (err) {
            console.error("Failed to save address", err);
            setError(err.response?.data?.message || "Failed to save address. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;

        try {
            await api.delete(`/addresses/${id}`);
            fetchAddresses();
        } catch (err) {
            alert("Failed to delete address.");
        }
    };

    const handleSetDefault = async (address) => {
        try {
            await api.put(`/addresses/${address.id}`, { ...address, is_default: true });
            fetchAddresses();
        } catch (err) {
            alert("Failed to set default address.");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20">
            <Loader className="spin" size={32} />
            <p className="mt-4">Loading your address book...</p>
        </div>
    );

    return (
        <div className="collaborator-addresses fade-in">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2>Address Book</h2>
                    <p style={{ color: '#666' }}>Manage your billing and shipping locations for faster checkouts.</p>
                </div>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Add New Address
                </button>
            </div>

            <div className="address-grid">
                {addresses.length > 0 ? (
                    addresses.map(addr => (
                        <div key={addr.id} className={`address-card ${addr.is_default ? 'default' : ''}`}>
                            <div className="address-card-header">
                                <div className="address-type-tag">
                                    {addr.type === 'shipping' ? <Truck size={14} /> : <CreditCard size={14} />}
                                    <span style={{ textTransform: 'capitalize' }}>{addr.type}</span>
                                </div>
                                {addr.is_default && (
                                    <div className="default-badge">
                                        <Star size={12} fill="currentColor" /> Default
                                    </div>
                                )}
                            </div>

                            <div className="address-details">
                                <p className="line-1">{addr.address_line1}</p>
                                {addr.address_line2 && <p className="line-2">{addr.address_line2}</p>}
                                <p className="city-state">{addr.city}, {addr.state} {addr.zip}</p>
                                <p className="country">{addr.country}</p>
                            </div>

                            <div className="address-card-actions">
                                {!addr.is_default && (
                                    <button
                                        className="btn-text"
                                        onClick={() => handleSetDefault(addr)}
                                        title="Set as Default"
                                    >
                                        Set Default
                                    </button>
                                )}
                                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                                    <button
                                        className="btn-icon-sm"
                                        onClick={() => handleOpenModal(addr)}
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className="btn-icon-sm danger"
                                        onClick={() => handleDelete(addr.id)}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '12px', border: '2px dashed #eee' }}>
                        <MapPin size={48} style={{ opacity: 0.1, marginBottom: '15px' }} />
                        <p style={{ color: '#999' }}>Your address book is empty.</p>
                        <button className="btn-text" onClick={() => handleOpenModal()} style={{ color: '#EC4E15', fontWeight: '600' }}>Add your first address</button>
                    </div>
                )}
            </div>

            {/* Address Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content address-modal">
                        <button className="modal-close" onClick={() => setShowModal(false)}>
                            <X size={20} />
                        </button>
                        <div className="modal-header">
                            <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <form onSubmit={handleSubmit} className="modern-form">
                            <div className="form-group">
                                <label>Address Type</label>
                                <div className="type-toggle" style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                    <label className={`toggle-option ${formData.type === 'shipping' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="shipping"
                                            checked={formData.type === 'shipping'}
                                            onChange={handleInputChange}
                                        />
                                        <Truck size={16} /> Shipping
                                    </label>
                                    <label className={`toggle-option ${formData.type === 'billing' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="billing"
                                            checked={formData.type === 'billing'}
                                            onChange={handleInputChange}
                                        />
                                        <CreditCard size={16} /> Billing
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Address Line 1*</label>
                                <input
                                    type="text"
                                    name="address_line1"
                                    value={formData.address_line1}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 123 Industrial Way"
                                    className="modern-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Address Line 2 (Optional)</label>
                                <input
                                    type="text"
                                    name="address_line2"
                                    value={formData.address_line2}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Suite 500"
                                    className="modern-input"
                                />
                            </div>

                            <div className="form-grid-3">
                                <div className="form-group">
                                    <label>City*</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                        className="modern-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>State*</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        required
                                        className="modern-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Zip Code*</label>
                                    <input
                                        type="text"
                                        name="zip"
                                        value={formData.zip}
                                        onChange={handleInputChange}
                                        required
                                        className="modern-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Country*</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    required
                                    className="modern-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="checkbox-toggle">
                                    <input
                                        type="checkbox"
                                        name="is_default"
                                        checked={formData.is_default}
                                        onChange={handleInputChange}
                                    />
                                    <span>Set as default {formData.type} address</span>
                                </label>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? <Loader className="spin" size={18} /> : (editingAddress ? 'Update Location' : 'Save Location')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollaboratorAddresses;
