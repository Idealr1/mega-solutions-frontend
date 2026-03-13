import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FileText, Eye, CheckCircle, Clock, XCircle, AlertCircle, Loader, ShoppingBag } from 'lucide-react';

const CollaboratorQuotes = () => {
    const { user } = useAuth();
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // ID of quote being converted
    const [selectedQuote, setSelectedQuote] = useState(null);

    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        try {
            const response = await api.get('/quotes');
            setQuotes(response.data.data || response.data || []);
        } catch (error) {
            console.error("Failed to fetch quotes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConvert = async (quoteId) => {
        if (!window.confirm("Convert this approved quote to a formal order?")) return;

        setActionLoading(quoteId);
        try {
            const response = await api.post(`/quotes/${quoteId}/convert`);
            alert("Quote converted successfully! Redirecting to orders...");
            fetchQuotes(); // Refresh
        } catch (err) {
            alert(err.response?.data?.message || "Conversion failed. Please check permissions.");
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return <span className="status-badge approved"><CheckCircle size={14} /> Approved</span>;
            case 'submitted': return <span className="status-badge pending"><Clock size={14} /> Submitted</span>;
            case 'converted': return <span className="status-badge success" style={{ background: '#e0f2fe', color: '#0369a1' }}><ShoppingBag size={14} /> Converted</span>;
            case 'expired': return <span className="status-badge rejected"><XCircle size={14} /> Expired</span>;
            default: return <span className="status-badge">{status}</span>;
        }
    };

    const hasPermission = (permission) => {
        if (!user?.parent_id) return true; // Parent account has all permissions
        return user?.permissions?.includes(permission);
    };

    if (loading) return (
        <div className="p-4 flex flex-col items-center gap-4">
            <Loader className="spin" />
            <p>Loading your quotes...</p>
        </div>
    );

    return (
        <div className="collaborator-quotes">
            <div className="section-header" style={{ marginBottom: '30px' }}>
                <h2>My Quotes</h2>
                <p style={{ color: '#666' }}>Track your professional inquiries and manage approvals.</p>
            </div>

            <div className="table-responsive">
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Quote ID</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Locked Price</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quotes.length > 0 ? (
                            quotes.map(quote => (
                                <tr key={quote.id}>
                                    <td><span style={{ fontWeight: '600' }}>#{quote.id}</span></td>
                                    <td>{new Date(quote.created_at).toLocaleDateString()}</td>
                                    <td>{getStatusBadge(quote.status)}</td>
                                    <td><span style={{ fontSize: '1.1rem', fontWeight: '500' }}>${quote.total_price}</span></td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button
                                                className="btn-sm"
                                                onClick={() => setSelectedQuote(quote)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <Eye size={16} /> Details
                                            </button>

                                            {quote.status === 'approved' && (
                                                <button
                                                    className="btn-primary btn-sm"
                                                    disabled={actionLoading === quote.id || !hasPermission('place_orders')}
                                                    onClick={() => handleConvert(quote.id)}
                                                >
                                                    {actionLoading === quote.id ? <Loader className="spin" size={14} /> : 'Convert to Order'}
                                                </button>
                                            )}
                                        </div>
                                        {!hasPermission('place_orders') && quote.status === 'approved' && (
                                            <small style={{ color: '#999', display: 'block', marginTop: '4px' }}>
                                                Awaiting Manager Approval
                                            </small>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '60px' }}>
                                    <FileText size={48} style={{ opacity: 0.1, marginBottom: '15px' }} />
                                    <p style={{ color: '#999' }}>No quotes found. Items missing from price negotiation?</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Simple Details Modal */}
            {selectedQuote && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="modal-content" style={{ backgroundColor: '#white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', position: 'relative' }}>
                        <button onClick={() => setSelectedQuote(null)} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
                        <h3>Quote #{selectedQuote.id} Details</h3>
                        <p style={{ color: '#666', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            Created on {new Date(selectedQuote.created_at).toLocaleDateString()} • Status: <span style={{ textTransform: 'capitalize' }}>{selectedQuote.status}</span>
                        </p>

                        <div className="quote-items-list" style={{ marginTop: '20px' }}>
                            {(selectedQuote.items || []).map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                                    <div>
                                        <strong>{item.product?.title || 'Product'}</strong>
                                        <div style={{ fontSize: '12px', color: '#888' }}>Qty: {item.quantity} × ${item.price}</div>
                                    </div>
                                    <div>${item.total_price || (item.quantity * item.price)}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            <span>Total (Negotiated)</span>
                            <span style={{ color: '#EC4E15' }}>${selectedQuote.total_price}</span>
                        </div>

                        <div style={{ marginTop: '30px' }}>
                            {selectedQuote.status === 'approved' && hasPermission('place_orders') && (
                                <button
                                    className="btn-primary"
                                    style={{ width: '100%' }}
                                    onClick={() => handleConvert(selectedQuote.id)}
                                    disabled={actionLoading === selectedQuote.id}
                                >
                                    APPROVE & PROCEED TO ORDER
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollaboratorQuotes;
