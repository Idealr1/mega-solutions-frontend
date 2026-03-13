import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import OrderTracking from '../OrderTracking';
import './UserDashboard.css';

const UserDashboard = () => {
    const { user, setUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'addresses', 'settings'
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    // Address Form State
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressForm, setAddressForm] = useState({
        type: 'shipping',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        zip: '',
        country: 'USA',
        is_default: false
    });

    // Profile Form State
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        company_name: user?.company_name || '',
        tax_id: user?.tax_id || ''
    });

    // Password Form State
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });

    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (activeTab === 'orders') fetchOrders();
        if (activeTab === 'addresses') fetchAddresses();
        if (activeTab === 'settings') {
            setProfileForm({
                name: user?.name || '',
                email: user?.email || '',
                company_name: user?.company_name || '',
                tax_id: user?.tax_id || ''
            });
        }
    }, [activeTab, user]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/orders');
            setOrders(response.data.data || response.data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/addresses');
            setAddresses(response.data);
        } catch (error) {
            console.error("Failed to fetch addresses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/addresses', addressForm);
            setMessage({ type: 'success', text: 'Address added successfully!' });
            setShowAddressForm(false);
            fetchAddresses();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to add address.' });
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            await api.delete(`/addresses/${id}`);
            fetchAddresses();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete address.' });
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/auth/profile', profileForm);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setUser(response.data.user);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile.' });
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put('/auth/password', passwordForm);
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password.' });
        }
    };

    return (
        <div className="user-dashboard-page fade-in">
            <div className="user-dashboard-container">
                <div className="user-sidebar">
                    <div className="user-profile-summary">
                        <div className="user-avatar">{user?.name?.charAt(0)}</div>
                        <h3>{user?.name}</h3>
                        <p>{user?.email}</p>
                    </div>
                    <ul className="user-nav">
                        <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>My Orders</li>
                        <li className={activeTab === 'addresses' ? 'active' : ''} onClick={() => setActiveTab('addresses')}>Address Book</li>
                        <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>Account Settings</li>
                    </ul>
                </div>

                <div className="user-content">
                    {message.text && (
                        <div className={`dashboard-message ${message.type}`}>
                            {message.text}
                            <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <>
                            <h1>My Orders</h1>
                            <p className="user-content-subtitle">Track your recent purchases and delivery status.</p>
                            <div className="user-orders-list">
                                {loading ? (
                                    <div className="admin-loading">Loading your orders...</div>
                                ) : orders.length > 0 ? (
                                    orders.map(order => (
                                        <div key={order.id} className={`order-card ${expandedOrderId === order.id ? 'expanded' : ''}`}>
                                            <div className="order-main-info" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                                                <div className="order-id-block">
                                                    <span className="label">Order Number</span>
                                                    <span className="value">#{order.id}</span>
                                                </div>
                                                <div className="order-date-block">
                                                    <span className="label">Date</span>
                                                    <span className="value">{new Date(order.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="order-total-block">
                                                    <span className="label">Total</span>
                                                    <span className="value">${Number(order.total_price).toFixed(2)}</span>
                                                </div>
                                                <div className="order-status-block">
                                                    <span className={`status-pill ${order.status}`}>{order.status}</span>
                                                </div>
                                                <button className="expand-indicator">
                                                    {expandedOrderId === order.id ? 'Close' : 'Track'}
                                                </button>
                                            </div>

                                            {expandedOrderId === order.id && (
                                                <div className="order-expanded-content fade-in">
                                                    <OrderTracking
                                                        status={order.status}
                                                        estimatedDays={order.estimated_delivery_days}
                                                        rejectionReason={order.rejection_reason}
                                                    />

                                                    <div className="order-details-summary">
                                                        <div className="order-items-detail">
                                                            <h4>Items Ordered</h4>
                                                            <div className="items-list">
                                                                {order.items?.map((item, idx) => (
                                                                    <div key={idx} className="item-row">
                                                                        <span className="item-name">{item.quantity}x {item.product?.title || `Product ID: ${item.product_id}`}</span>
                                                                        <span className="item-price">${(Number(item.unit_price) * item.quantity).toFixed(2)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="order-shipping-detail">
                                                            <h4>Shipping Address</h4>
                                                            <p>{order.first_name} {order.last_name}</p>
                                                            <p>{order.address}</p>
                                                            <p>{order.city}, {order.state} {order.zip_code}</p>
                                                            <p>{order.country}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-orders">
                                        <p>You haven't placed any orders yet.</p>
                                        <button className="btn-primary" onClick={() => window.location.href = '/products'}>Start Shopping</button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'addresses' && (
                        <div className="address-book-section">
                            <div className="section-header">
                                <h1>Address Book</h1>
                                <button className="btn-add-address" onClick={() => setShowAddressForm(!showAddressForm)}>
                                    {showAddressForm ? 'Cancel' : '+ Add New Address'}
                                </button>
                            </div>

                            {showAddressForm && (
                                <form className="address-form fade-in" onSubmit={handleAddressSubmit}>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Address Type</label>
                                            <select value={addressForm.type} onChange={e => setAddressForm({ ...addressForm, type: e.target.value })}>
                                                <option value="shipping">Shipping</option>
                                                <option value="billing">Billing</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Address Line 1</label>
                                            <input type="text" required value={addressForm.address_line1} onChange={e => setAddressForm({ ...addressForm, address_line1: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Address Line 2 (Optional)</label>
                                            <input type="text" value={addressForm.address_line2} onChange={e => setAddressForm({ ...addressForm, address_line2: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>City</label>
                                            <input type="text" required value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>State</label>
                                            <input type="text" required value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>ZIP/Postal Code</label>
                                            <input type="text" required value={addressForm.zip} onChange={e => setAddressForm({ ...addressForm, zip: e.target.value })} />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-submit">Save Address</button>
                                </form>
                            )}

                            <div className="addresses-grid">
                                {loading ? (
                                    <p>Loading addresses...</p>
                                ) : addresses.length > 0 ? (
                                    addresses.map(addr => (
                                        <div key={addr.id} className="address-card">
                                            <div className="address-card-header">
                                                <span className="type-badge">{addr.type}</span>
                                                {addr.is_default && <span className="default-badge">Default</span>}
                                            </div>
                                            <p>{addr.address_line1}</p>
                                            {addr.address_line2 && <p>{addr.address_line2}</p>}
                                            <p>{addr.city}, {addr.state} {addr.zip}</p>
                                            <p>{addr.country}</p>
                                            <div className="address-actions">
                                                <button className="btn-delete" onClick={() => handleDeleteAddress(addr.id)}>Delete</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-data">No addresses saved yet.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="account-settings-section">
                            <h1>Account Settings</h1>

                            <div className="settings-container">
                                <form className="settings-form" onSubmit={handleProfileUpdate}>
                                    <h3>Personal Information</h3>
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} />
                                    </div>
                                    <button type="submit" className="btn-submit">Update Profile</button>
                                </form>

                                <form className="settings-form" onSubmit={handlePasswordUpdate}>
                                    <h3>Security</h3>
                                    <div className="form-group">
                                        <label>Current Password</label>
                                        <input type="password" required value={passwordForm.current_password} onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <input type="password" required value={passwordForm.password} onChange={e => setPasswordForm({ ...passwordForm, password: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm New Password</label>
                                        <input type="password" required value={passwordForm.password_confirmation} onChange={e => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })} />
                                    </div>
                                    <button type="submit" className="btn-submit">Change Password</button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
