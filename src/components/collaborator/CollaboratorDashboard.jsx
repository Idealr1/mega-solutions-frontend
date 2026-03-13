import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './CollaboratorDashboard.css';

const CollaboratorDashboard = () => {
    const { user } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Wallet Data
                try {
                    const walletRes = await api.get('/wallet');
                    setWallet(walletRes.data);
                } catch (e) {
                    console.warn("Wallet data not available yet", e);
                }

                // Fetch Recent Orders
                try {
                    const ordersRes = await api.get('/orders');
                    // Limit to 5 recent orders
                    const allOrders = ordersRes.data.data || [];
                    setRecentOrders(allOrders.slice(0, 5));
                } catch (e) {
                    console.warn("Orders data not available", e);
                }

            } catch (err) {
                console.error("Error fetching dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-4">Loading dashboard...</div>;

    return (
        <div className="approved-dashboard">
            <div className="dashboard-header">
                <h2>Overview</h2>
                <p>Welcome back, {user?.name}</p>
            </div>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <h3>Total Spent</h3>
                    <div className="stat-value">
                        {wallet?.currency || '$'} {wallet?.total_spent?.toFixed(2) || '0.00'}
                    </div>
                </div>
                <div className="stat-card">
                    <h3>Outstanding Balance</h3>
                    <div className="stat-value">
                        {wallet?.currency || '$'} {wallet?.outstanding_balance?.toFixed(2) || '0.00'}
                    </div>
                </div>
                <div className="stat-card">
                    <h3>Total Orders</h3>
                    <div className="stat-value">{wallet?.orders_count || 0}</div>
                </div>
            </div>

            <div className="dashboard-recent">
                <h2>Recent Activity</h2>
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentOrders.length > 0 ? (
                            recentOrders.map(order => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                                    <td>${order.total_price}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No recent activity.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CollaboratorDashboard;
