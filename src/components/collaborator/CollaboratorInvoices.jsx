import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileCheck, Download, Loader } from 'lucide-react';

const CollaboratorInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await api.get('/invoices');
                setInvoices(response.data.data || response.data || []);
            } catch (err) {
                console.error("Failed to fetch invoices", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    if (loading) return <div>Loading invoices...</div>;

    return (
        <div className="collaborator-invoices">
            <h2>Invoices</h2>
            <p>View and download your billing documents.</p>

            <div className="invoices-list" style={{ marginTop: '30px' }}>
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Invoice #</th>
                            <th>Date</th>
                            <th>Order</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length > 0 ? (
                            invoices.map(inv => (
                                <tr key={inv.id}>
                                    <td>{inv.invoice_number}</td>
                                    <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                                    <td>#{inv.order_id}</td>
                                    <td>${inv.total_amount}</td>
                                    <td>
                                        <span className={`status-badge ${inv.status}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-icon">
                                            <Download size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                    No invoices found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CollaboratorInvoices;
