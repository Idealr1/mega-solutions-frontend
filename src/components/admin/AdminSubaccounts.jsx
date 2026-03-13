import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminSubaccounts = () => {
    const [subaccounts, setSubaccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetch for subaccounts managed by admin
        // Real endpoint might be /admin/subaccounts
        const fetchSubaccounts = async () => {
            setLoading(false);
            // Simulated data
            setSubaccounts([
                { id: 1, name: 'John Doe Sales', parent_company: 'Acme Corp', email: 'john@acme.com', status: 'active' },
                { id: 2, name: 'Jane Smith Purchase', parent_company: 'Globex', email: 'jane@globex.com', status: 'pending' }
            ]);
        };

        fetchSubaccounts();
    }, []);

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>Manage Subaccounts</h1>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Parent Company</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subaccounts.length > 0 ? (
                            subaccounts.map(account => (
                                <tr key={account.id}>
                                    <td>{account.name}</td>
                                    <td>{account.parent_company}</td>
                                    <td>{account.email}</td>
                                    <td><span className={`status-badge ${account.status}`}>{account.status}</span></td>
                                    <td>
                                        {account.status === 'pending' && <button className="btn-action approve">Approve</button>}
                                        <button className="btn-action edit">Edit</button>
                                        <button className="btn-action delete">Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">No subaccounts found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminSubaccounts;
