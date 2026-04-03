import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2, Mail, Calendar, X } from 'lucide-react';
import './AdminCommon.css';

const AdminSubscribers = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        try {
            const response = await api.get('/subscribers');
            setSubscribers(response.data.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch subscribers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this subscriber?')) return;

        try {
            await api.delete(`/subscribers/${id}`);
            setSubscribers(prev => prev.filter(item => item.id !== id));
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        } catch (error) {
            console.error('Failed to delete subscriber:', error);
            alert(error.response?.data?.message || 'Failed to delete. Please try again.');
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected subscribers?`)) return;

        setIsBulkDeleting(true);
        try {
            await api.post('/bulk-delete', {
                ids: selectedIds,
                type: 'subscribers'
            });
            setSubscribers(prev => prev.filter(item => !selectedIds.includes(item.id)));
            setSelectedIds([]);
            alert('Selected subscribers deleted successfully.');
        } catch (error) {
            console.error('Failed to bulk delete subscribers:', error);
            alert(error.response?.data?.message || 'Failed to bulk delete. Please try again.');
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === subscribers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(subscribers.map(i => i.id));
        }
    };

    const toggleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (isLoading) return <div className="admin-loading">Loading subscribers...</div>;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>Newsletter Subscribers</h1>
                    <span className="count-badge">{subscribers.length} Emails</span>
                </div>
                <div className="header-actions">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="btn-danger"
                            disabled={isBulkDeleting}
                        >
                            {isBulkDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
                        </button>
                    )}
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <input
                                    type="checkbox"
                                    checked={subscribers.length > 0 && selectedIds.length === subscribers.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th>ID</th>
                            <th>Email Address</th>
                            <th>Subscribed On</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscribers.length > 0 ? (
                            subscribers.map(item => (
                                <tr key={item.id} className={selectedIds.includes(item.id) ? 'selected-row' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(item.id)}
                                            onChange={() => toggleSelectOne(item.id)}
                                        />
                                    </td>
                                    <td>#{item.id}</td>
                                    <td><strong><a href={`mailto:${item.email}`}>{item.email}</a></strong></td>
                                    <td>{new Date(item.created_at || Date.now()).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button onClick={() => handleDelete(item.id)} className="btn-action delete" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                    No subscribers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminSubscribers;
