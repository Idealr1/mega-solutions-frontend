import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import OrderTracking from '../OrderTracking';

const CollaboratorOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders');
                setOrders(response.data.data || response.data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) return <div className="admin-loading">Loading orders...</div>;

    return (
        <div className="collaborator-orders fade-in">
            <div className="section-header">
                <h2>My Orders</h2>
                <p>Track your order status and view delivery estimates.</p>
            </div>

            <div className="orders-table-container">
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? (
                            orders.map(order => (
                                <React.Fragment key={order.id}>
                                    <tr className={expandedOrderId === order.id ? 'active-row' : ''}>
                                        <td><strong>#{order.id}</strong></td>
                                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status-badge ${order.status}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td><strong>${Number(order.total_price).toFixed(2)}</strong></td>
                                        <td>
                                            <button
                                                className="btn-text"
                                                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                            >
                                                {expandedOrderId === order.id ? 'Hide Details' : 'Track Order'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedOrderId === order.id && (
                                        <tr className="tracking-row">
                                            <td colSpan="5">
                                                <div className="tracking-expand-container fade-in">
                                                    <OrderTracking
                                                        status={order.status}
                                                        estimatedDays={order.estimated_delivery_days}
                                                        rejectionReason={order.rejection_reason}
                                                    />

                                                    <div className="order-details-grid">
                                                        <div className="order-items-summary">
                                                            <h4>Order Summary</h4>
                                                            <div className="summary-grid">
                                                                {order.items?.map((item, idx) => (
                                                                    <div key={idx} className="summary-item-mini">
                                                                        <span>{item.quantity}x {item.product?.title || 'Unknown Item'}</span>
                                                                        <span>${(Number(item.unit_price) * item.quantity).toFixed(2)}</span>
                                                                    </div>
                                                                ))}
                                                                <div className="summary-total-row">
                                                                    <span><strong>Total Price:</strong></span>
                                                                    <span><strong>${Number(order.total_price).toFixed(2)}</strong></span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="order-shipping-summary">
                                                            <h4>Shipping Address</h4>
                                                            <p><strong>{order.first_name} {order.last_name}</strong></p>
                                                            <p>{order.address}</p>
                                                            <p>{order.city}, {order.state} {order.zip_code}</p>
                                                            <p>{order.country}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .active-row { background: #f8fafc; }
                .tracking-row td { padding: 0 !important; border-bottom: 2px solid #EC4E15 !important; }
                .tracking-expand-container { padding: 25px; background: #fff; border: 1px solid #eee; border-radius: 0 0 12px 12px; }
                .order-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; padding-top: 25px; border-top: 1px dashed #eee; }
                .order-items-summary h4, .order-shipping-summary h4 { margin: 0 0 15px 0; font-size: 16px; color: #333; }
                
                .summary-grid { display: grid; gap: 10px; }
                .summary-item-mini { display: flex; justify-content: space-between; font-size: 14px; color: #666; }
                .summary-total-row { display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px solid #f1f1f1; font-size: 15px; color: #EC4E15; }
                
                .order-shipping-summary p { margin-bottom: 5px; color: #666; font-size: 14px; }
                
                .btn-text { background: #fef2ee; border: none; color: #EC4E15; font-weight: 600; cursor: pointer; padding: 6px 12px; border-radius: 6px; }
                .btn-text:hover { background: #EC4E15; color: #fff; }

                .status-badge {
                    padding: 4px 10px; border-radius: 20px; font-size: 11px;
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
            `}} />
        </div>
    );
};

export default CollaboratorOrders;
