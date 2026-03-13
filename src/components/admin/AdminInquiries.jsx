import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2, Eye, Mail, Phone, Calendar, User, MessageSquare, X } from 'lucide-react';
import './AdminCommon.css';

const AdminInquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [viewingInquiry, setViewingInquiry] = useState(null);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const response = await api.get('/contact'); // Assuming GET /contact returns inquiries
            setInquiries(response.data.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch inquiries:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this inquiry?')) return;

        try {
            await api.delete(`/contact/${id}`);
            setInquiries(prev => prev.filter(item => item.id !== id));
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        } catch (error) {
            console.error('Failed to delete inquiry:', error);
            if (error.response?.status === 500) {
                alert('Database Error: This inquiry cannot be deleted due to a server-side issue.');
            } else {
                alert(error.response?.data?.message || 'Failed to delete inquiry. Please try again.');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected inquiries?`)) return;

        setIsBulkDeleting(true);
        try {
            await api.post('/bulk-delete', {
                ids: selectedIds,
                type: 'inquiries'
            });
            setInquiries(prev => prev.filter(item => !selectedIds.includes(item.id)));
            setSelectedIds([]);
            alert('Selected inquiries deleted successfully.');
        } catch (error) {
            console.error('Failed to bulk delete inquiries:', error);
            if (error.response?.status === 500) {
                alert('Database Error: A server-side error occurred while processing bulk deletion.');
            } else {
                alert(error.response?.data?.message || 'Failed to bulk delete inquiries. Please try again.');
            }
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === inquiries.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(inquiries.map(i => i.id));
        }
    };

    const toggleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const openInquiry = (inquiry) => {
        setViewingInquiry(inquiry);
    };

    const closeInquiry = () => {
        setViewingInquiry(null);
    };

    if (isLoading) return <div className="admin-loading">Loading inquiries...</div>;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>Contact Inquiries</h1>
                    <span className="count-badge">{inquiries.length} Messages</span>
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
                                    checked={inquiries.length > 0 && selectedIds.length === inquiries.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Date</th>
                            <th>Message Preview</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inquiries.length > 0 ? (
                            inquiries.map(item => (
                                <tr key={item.id} className={selectedIds.includes(item.id) ? 'selected-row' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(item.id)}
                                            onChange={() => toggleSelectOne(item.id)}
                                        />
                                    </td>
                                    <td>#{item.id}</td>
                                    <td><strong>{item.name}</strong></td>
                                    <td>{item.email}</td>
                                    <td>{new Date(item.created_at || Date.now()).toLocaleDateString()}</td>
                                    <td className="text-truncate" style={{ maxWidth: '250px' }}>
                                        {item.message?.substring(0, 50)}...
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button onClick={() => openInquiry(item)} className="btn-action" title="View">
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="btn-action delete" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                    No inquiries found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Inquiry Details Modal */}
            {viewingInquiry && (
                <div className="modal-overlay" onClick={closeInquiry}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeInquiry}><X size={24} /></button>

                        <div className="modal-header">
                            <h2>Inquiry Details</h2>
                        </div>

                        <div className="inquiry-details">
                            <div className="detail-item">
                                <label><User size={16} /> From:</label>
                                <p>{viewingInquiry.name}</p>
                            </div>
                            <div className="detail-item">
                                <label><Mail size={16} /> Email:</label>
                                <p><a href={`mailto:${viewingInquiry.email}`}>{viewingInquiry.email}</a></p>
                            </div>
                            {viewingInquiry.phone && (
                                <div className="detail-item">
                                    <label><Phone size={16} /> Phone:</label>
                                    <p>{viewingInquiry.phone}</p>
                                </div>
                            )}
                            <div className="detail-item">
                                <label><Calendar size={16} /> Received On:</label>
                                <p>{new Date(viewingInquiry.created_at).toLocaleString()}</p>
                            </div>
                            <div className="detail-item full-width">
                                <label><MessageSquare size={16} /> Message:</label>
                                <div className="message-content">
                                    {viewingInquiry.message}
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={closeInquiry}>Close</button>
                            <button className="btn-danger" onClick={() => { handleDelete(viewingInquiry.id); closeInquiry(); }}>
                                Delete Inquiry
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInquiries;
