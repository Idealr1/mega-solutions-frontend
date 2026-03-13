import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CollaboratorWallet = () => {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const response = await api.get('/wallet');
                setWallet(response.data);
            } catch (error) {
                console.error("Failed to fetch wallet", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWallet();
    }, []);

    if (loading) return <div>Loading wallet...</div>;

    return (
        <div className="collaborator-wallet">
            <h2>My Wallet</h2>

            <div className="dashboard-stats" style={{ marginTop: '30px' }}>
                <div className="stat-card">
                    <h3>Total Spent</h3>
                    <div className="stat-value">
                        {wallet?.currency || '$'} {wallet?.total_spent?.toFixed(2) || '0.00'}
                    </div>
                </div>
                <div className="stat-card">
                    <h3>Outstanding Balance</h3>
                    <div className="stat-value" style={{ color: wallet?.outstanding_balance > 0 ? 'red' : 'green' }}>
                        {wallet?.currency || '$'} {wallet?.outstanding_balance?.toFixed(2) || '0.00'}
                    </div>
                </div>
            </div>

            <div className="wallet-activity" style={{ marginTop: '40px' }}>
                <h3>Recent Transactions</h3>
                {/* Assuming wallet.recent_activity is an array of orders/transactions */}
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {wallet?.recent_activity?.length > 0 ? (
                            wallet.recent_activity.map(item => (
                                <tr key={item.id}>
                                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                                    <td>Order #{item.id}</td>
                                    <td>{wallet.currency} {item.total_price}</td>
                                    <td>{item.status}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No recent transactions.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CollaboratorWallet;
