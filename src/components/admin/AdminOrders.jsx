import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Eye, Edit2, Loader, CheckCircle, Package, Clock, Truck, X } from 'lucide-react';
import './AdminCommon.css';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [deliveryDays, setDeliveryDays] = useState(5);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    // Fetch single order details when selected
    useEffect(() => {
        if (selectedOrder && (!selectedOrder.items || selectedOrder.items.length === 0)) {
            const fetchOrderDetails = async () => {
                setLoadingDetails(true);
                try {
                    const res = await api.get(`/orders/${selectedOrder.id}`);
                    const details = res.data.data || res.data;
                    setSelectedOrder(details);
                } catch (err) {
                    console.error("Failed to fetch order details", err);
                } finally {
                    setLoadingDetails(false);
                }
            };
            fetchOrderDetails();
        }
    }, [selectedOrder?.id]);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus, metadata = {}) => {
        setUpdatingId(orderId);
        try {
            await api.put(`/orders/${orderId}`, { status: newStatus, ...metadata });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, ...metadata } : o));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: newStatus, ...metadata }));
            }
            return true;
        } catch (error) {
            console.error('Failed to update order status:', error);
            if (error.response?.data) {
                console.error('Detailed Error Data:', error.response.data);
                let msg = error.response.data.message || error.response.data.error || "Validation failed";

                // If there are specific validation errors, append the first one
                if (error.response.data.errors) {
                    const firstErrorKey = Object.keys(error.response.data.errors)[0];
                    const firstErrorMsg = error.response.data.errors[firstErrorKey][0];
                    msg += `: ${firstErrorMsg}`;
                }

                alert(`Error: ${msg}`);
            } else {
                alert("Failed to update status. Please try again.");
            }
            return false;
        } finally {
            setUpdatingId(null);
        }
    };

    const handleAcceptOrder = async () => {
        if (!selectedOrder) return;
        const success = await updateStatus(selectedOrder.id, 'accepted', {
            estimated_delivery_days: parseInt(deliveryDays)
        });
        if (success) setShowAcceptModal(false);
    };

    const handleRejectOrder = async () => {
        if (!selectedOrder) return;
        if (!rejectionReason.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }
        const success = await updateStatus(selectedOrder.id, 'rejected', { rejection_reason: rejectionReason });
        if (success) setShowRejectModal(false);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={14} />;
            case 'confirmed': return <CheckCircle size={14} />;
            case 'accepted': return <Package size={14} />;
            case 'in_production': return <Package size={14} />;
            case 'shipped': return <Truck size={14} />;
            case 'delivered': return <CheckCircle size={14} />;
            case 'rejected': return <X size={14} />;
            case 'cancelled': return <X size={14} />;
            default: return null;
        }
    };

    if (isLoading) return <div className="admin-loading">Loading orders...</div>;

    return (
        <div className="admin-page fade-in">
            <div className="admin-header">
                <div>
                    <h1>Order Management</h1>
                    <span className="count-badge">{orders.length} Orders</span>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? (
                            orders.map(order => (
                                <tr key={order.id}>
                                    <td><strong>#{order.id}</strong></td>
                                    <td>
                                        <div className="customer-info">
                                            <span>{order.first_name} {order.last_name}</span>
                                            <small>{order.email}</small>
                                        </div>
                                    </td>
                                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td>{order.items?.length || 0} items</td>
                                    <td className="price-cell"><strong>${Number(order.total_price).toFixed(2)}</strong></td>
                                    <td>
                                        <div className="status-selector-wrapper">
                                            <select
                                                className={`status-select ${order.status}`}
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                disabled={updatingId === order.id}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="accepted">Accepted</option>
                                                <option value="in_production">In Production</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="rejected">Rejected</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                            {updatingId === order.id && <Loader size={12} className="spin" />}
                                        </div>
                                    </td>
                                    <td>
                                        <button className="btn-action" title="View Details" onClick={() => setSelectedOrder(order)}>
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                    No orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal order-detail-modal">
                        <div className="modal-header">
                            <div className="modal-title-group">
                                <h2>Order Details #{selectedOrder.id}</h2>
                                <span className={`status-badge ${selectedOrder.status}`}>{selectedOrder.status}</span>
                            </div>
                            <button className="close-modal" onClick={() => setSelectedOrder(null)}>&times;</button>
                        </div>
                        <div className="modal-content">
                            {loadingDetails ? (
                                <div className="modal-loading">
                                    <Loader className="spin" size={32} />
                                    <p>Loading order items...</p>
                                </div>
                            ) : (
                                <>
                                    {selectedOrder.status === 'pending' && (
                                        <div className="admin-actions-bar fade-in">
                                            <button className="btn-accept" onClick={() => setShowAcceptModal(true)}>
                                                Accept Order
                                            </button>
                                            <button className="btn-reject" onClick={() => setShowRejectModal(true)}>
                                                Reject Order
                                            </button>
                                        </div>
                                    )}

                                    {selectedOrder.status === 'rejected' && (
                                        <div className="admin-rejection-info">
                                            <AlertCircle size={18} />
                                            <span><strong>Rejected:</strong> {selectedOrder.rejection_reason}</span>
                                        </div>
                                    )}

                                    <div className="detail-grid">
                                        <div className="detail-section">
                                            <h3>Customer Information</h3>
                                            <p><strong>Name:</strong> {selectedOrder.first_name} {selectedOrder.last_name}</p>
                                            <p><strong>Email:</strong> {selectedOrder.email}</p>
                                            <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                                        </div>
                                        <div className="detail-section">
                                            <h3>Shipping Address</h3>
                                            {selectedOrder.address ? (
                                                <>
                                                    <p>{selectedOrder.address}</p>
                                                    <p>{selectedOrder.city}, {selectedOrder.state} {selectedOrder.zip_code}</p>
                                                    <p>{selectedOrder.country}</p>
                                                </>
                                            ) : (
                                                <p className="no-data">No shipping address provided.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="detail-section">
                                        <h3>Ordered Items</h3>
                                        <table className="detail-items-table">
                                            <thead>
                                                <tr>
                                                    <th>Product ID/SKU</th>
                                                    <th>Price</th>
                                                    <th>Quantity</th>
                                                    <th>Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedOrder.items?.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td>
                                                            <div className="item-product-info">
                                                                <span className="item-title">{item.product?.title || 'Unknown Product'}</span>
                                                                <small className="item-sku">SKU: {item.product?.sku || item.variant_id || item.product_id}</small>
                                                            </div>
                                                        </td>
                                                        <td>${Number(item.unit_price).toFixed(2)}</td>
                                                        <td>{item.quantity}</td>
                                                        <td>${(Number(item.unit_price) * item.quantity).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan="3" style={{ textAlign: 'right' }}><strong>Grand Total:</strong></td>
                                                    <td><strong>${Number(selectedOrder.total_price).toFixed(2)}</strong></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Accept Order Modal */}
            {showAcceptModal && (
                <div className="admin-modal-overlay second-layer">
                    <div className="admin-modal tiny-modal">
                        <h3>Accept Order</h3>
                        <p>How many working days will it take to deliver this order?</p>
                        <div className="admin-form-group">
                            <input
                                type="number"
                                value={deliveryDays}
                                onChange={(e) => setDeliveryDays(e.target.value)}
                                min="1"
                                className="modern-input"
                            />
                            <span className="input-suffix">Working Days</span>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowAcceptModal(false)}>Cancel</button>
                            <button className="admin-btn-primary" onClick={handleAcceptOrder}>Confirm & Notify</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Order Modal */}
            {showRejectModal && (
                <div className="admin-modal-overlay second-layer">
                    <div className="admin-modal tiny-modal">
                        <h3>Reject Order</h3>
                        <p>Please provide a reason for rejecting this order:</p>
                        <div className="admin-form-group">
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="e.g. Out of stock, Delivery zone not supported..."
                                className="modern-textarea"
                            />
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
                            <button className="admin-btn-danger" onClick={handleRejectOrder}>Reject & Notify</button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .customer-info {
                    display: flex;
                    flex-direction: column;
                }
                .customer-info small {
                    color: #8A949C;
                }
                .price-cell {
                    color: #EC4E15;
                }
                .status-selector-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .status-select {
                    padding: 4px 8px;
                    border-radius: 4px;
                    border: 1px solid #ddd;
                    font-size: 13px;
                    font-weight: 500;
                    text-transform: capitalize;
                }
                .status-select.pending { background: #fff8e1; color: #f57f17; }
                .status-select.processing { background: #e3f2fd; color: #1976d2; }
                .status-select.shipped { background: #f3e5f5; color: #7b1fa2; }
                .status-select.completed { background: #e8f5e9; color: #2e7d32; }
                .status-select.cancelled { background: #ffebee; color: #c62828; }

                .modal-title-group { display: flex; align-items: center; gap: 15px; }
                .status-badge {
                    padding: 4px 10px; border-radius: 20px; font-size: 12px;
                    text-transform: uppercase; font-weight: 600;
                }
                .status-badge.pending { background: #fff8e1; color: #f57f17; }
                .status-badge.confirmed { background: #f1f5f9; color: #475569; }
                .status-badge.accepted { background: #e0f2fe; color: #0369a1; }
                .status-badge.in_production { background: #e3f2fd; color: #1976d2; }
                .status-badge.shipped { background: #f3e5f5; color: #7b1fa2; }
                .status-badge.delivered { background: #e8f5e9; color: #2e7d32; }
                .status-badge.rejected { background: #ffebee; color: #c62828; }
                .status-badge.cancelled { background: #f1f5f9; color: #94a3b8; }

                .admin-actions-bar {
                    display: flex; gap: 10px; margin-bottom: 25px;
                    padding: 15px; background: #f1f5f9; border-radius: 8px;
                }
                .btn-accept { background: #10b981; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; }
                .btn-reject { background: #ef4444; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; }
                
                .admin-rejection-info {
                    display: flex; align-items: center; gap: 10px;
                    padding: 12px; background: #fff1f2; color: #be123c;
                    border-radius: 8px; margin-bottom: 25px; font-size: 14px;
                }

                .second-layer { z-index: 1001; }
                .tiny-modal { max-width: 400px; padding: 25px; }
                .tiny-modal h3 { margin-top: 0; margin-bottom: 10px; }
                .admin-form-group { margin: 20px 0; display: flex; align-items: center; gap: 10px; }
                .modern-input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
                .modern-textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; height: 100px; resize: none; }
                .modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
                .admin-btn-primary { background: #EC4E15; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; }
                .admin-btn-danger { background: #dc2626; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; }

                /* Modal Styles */
                .admin-modal-overlay {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex; justify-content: center; align-items: center;
                    z-index: 1000;
                }
                .admin-modal {
                    background: #fff;
                    padding: 30px;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 800px;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                }
                .modal-header {
                    display: flex; justify-content: space-between;
                    align-items: center; margin-bottom: 20px;
                    border-bottom: 1px solid #eee; padding-bottom: 15px;
                }
                .modal-header h2 { margin: 0; font-size: 24px; }
                .close-modal {
                    background: none; border: none; font-size: 28px; cursor: pointer;
                }
                .detail-grid {
                    display: grid; grid-template-columns: 1fr 1fr; gap: 30px;
                    margin-bottom: 30px;
                }
                .detail-section h3 {
                    font-size: 16px; margin-bottom: 12px; color: #333;
                    border-left: 3px solid #EC4E15; padding-left: 10px;
                }
                .detail-section p { margin-bottom: 5px; color: #666; font-size: 14px; }
                .detail-items-table {
                    width: 100%; border-collapse: collapse; margin-top: 10px;
                }
                .detail-items-table th {
                    text-align: left; background: #f8f9fa; padding: 10px; font-size: 13px;
                }
                .detail-items-table td { padding: 10px; border-bottom: 1px solid #eee; font-size: 14px; }
                .item-product-info { display: flex; flex-direction: column; gap: 2px; }
                .item-title { font-weight: 500; color: #333; }
                .item-sku { color: #8A949C; font-size: 11px; }
                .no-data { font-style: italic; color: #999; }
            `}} />
        </div>
    );
};

export default AdminOrders;

