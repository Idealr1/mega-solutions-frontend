import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Zap, Plus, X, Loader, CheckCircle, AlertCircle, ShoppingCart, FileText, Trash2 } from 'lucide-react';
import './CollaboratorQuickOrder.css';

const CollaboratorQuickOrder = () => {
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [rows, setRows] = useState([
        { id: Date.now(), sku: '', quantity: 1, loading: false, product: null, found: null, error: null }
    ]);

    const handleAddRow = () => {
        setRows([...rows, { id: Date.now(), sku: '', quantity: 1, loading: false, product: null, found: null, error: null }]);
    };

    const handleRemoveRow = (id) => {
        if (rows.length === 1) {
            setRows([{ id: Date.now(), sku: '', quantity: 1, loading: false, product: null, found: null, error: null }]);
            return;
        }
        setRows(rows.filter(row => row.id !== id));
    };

    const handleInputChange = (id, field, value) => {
        setRows(rows.map(row => {
            if (row.id === id) {
                return { ...row, [field]: value, error: null };
            }
            return row;
        }));
    };

    const validateRow = async (id) => {
        const row = rows.find(r => r.id === id);
        if (!row.sku.trim()) return;

        setRows(rows.map(r => r.id === id ? { ...r, loading: true, error: null } : r));

        try {
            const response = await api.post('/quick-order/validate', {
                items: [{ sku: row.sku, quantity: row.quantity }]
            });

            const result = response.data.results?.[0] || response.data.items?.[0]; // Support both backend formats

            setRows(rows.map(r => {
                if (r.id === id) {
                    return {
                        ...r,
                        loading: false,
                        found: result.found,
                        product: result.product,
                        error: result.found ? null : (result.message || 'Product not found')
                    };
                }
                return r;
            }));
        } catch (err) {
            setRows(rows.map(r => r.id === id ? { ...r, loading: false, error: 'Validation failed' } : r));
        }
    };

    const handleBulkAddToCart = () => {
        const validItems = rows.filter(r => r.found && r.product);
        if (validItems.length === 0) {
            alert("No valid products to add.");
            return;
        }

        validItems.forEach(item => {
            addToCart({
                ...item.product,
                quantity: parseInt(item.quantity) || 1
            });
        });

        alert(`Added ${validItems.length} items to your cart!`);
    };

    const handleBulkAddToQuote = async () => {
        const validItems = rows.filter(r => r.found && r.product);
        if (validItems.length === 0) {
            alert("No valid products to add.");
            return;
        }

        try {
            await api.post('/quotes', {
                items: validItems.map(item => ({
                    product_id: item.product.id,
                    quantity: parseInt(item.quantity) || 1
                }))
            });
            alert("Items successfully added to a new Quote!");
            // Optionally clear the list
            setRows([{ id: Date.now(), sku: '', quantity: 1, loading: false, product: null, found: null, error: null }]);
        } catch (err) {
            alert("Failed to create quote. Please try again.");
        }
    };

    return (
        <div className="collaborator-quick-order">
            <div className="section-header" style={{ marginBottom: '30px' }}>
                <h2>Quick Order</h2>
                <p style={{ color: '#666' }}>Enter SKUs or Product Titles to quickly build your order.</p>
            </div>

            <div className="quick-order-table-wrapper" style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <table className="quick-order-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '15px' }}>SKU / Title (Fuzzy Search)</th>
                            <th style={{ padding: '15px', width: '120px' }}>Quantity</th>
                            <th style={{ padding: '15px' }}>Product Info</th>
                            <th style={{ padding: '15px', width: '100px' }}>Status</th>
                            <th style={{ padding: '15px', textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                <td style={{ padding: '10px' }}>
                                    <input
                                        type="text"
                                        className="modern-input"
                                        placeholder="Enter SKU or Product Name..."
                                        value={row.sku}
                                        onChange={(e) => handleInputChange(row.id, 'sku', e.target.value)}
                                        onBlur={() => validateRow(row.id)}
                                        style={{ width: '100%' }}
                                    />
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <input
                                        type="number"
                                        className="modern-input"
                                        min="1"
                                        value={row.quantity}
                                        onChange={(e) => handleInputChange(row.id, 'quantity', e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                </td>
                                <td style={{ padding: '10px' }}>
                                    {row.loading ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                                            <Loader className="spin" size={16} /> Validating...
                                        </div>
                                    ) : row.product ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' }}>
                                                <img src={row.product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '14px' }}>{row.product.title}</div>
                                                <div style={{ fontSize: '12px', color: '#EC4E15' }}>${row.product.price?.toFixed(2)}</div>
                                            </div>
                                        </div>
                                    ) : row.error ? (
                                        <span style={{ color: '#dc2626', fontSize: '13px' }}>{row.error}</span>
                                    ) : (
                                        <span style={{ color: '#aaa', fontSize: '13px' }}>Awaiting input...</span>
                                    )}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                    {row.found === true && <CheckCircle color="#10b981" size={20} />}
                                    {row.found === false && <AlertCircle color="#dc2626" size={20} />}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'right' }}>
                                    <button
                                        onClick={() => handleRemoveRow(row.id)}
                                        style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="table-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="btn-secondary" onClick={handleAddRow} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> Add Another Row
                    </button>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button
                            className="btn-secondary"
                            onClick={handleBulkAddToQuote}
                            disabled={!rows.some(r => r.found)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f3f4f6' }}
                        >
                            <FileText size={18} /> Build Bulk Quote
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleBulkAddToCart}
                            disabled={!rows.some(r => r.found)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <ShoppingCart size={18} /> Add All to Cart
                        </button>
                    </div>
                </div>
            </div>

            <div className="quick-order-tips" style={{ marginTop: '40px', background: '#fffbeb', border: '1px solid #fef3c7', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ color: '#92400e', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={18} /> Pro Tip
                </h4>
                <p style={{ color: '#b45309', fontSize: '14px', margin: 0 }}>
                    You don't need to remember exact SKU codes. Our fuzzy search works on product titles too! Just type part of the cabinet name and hit tab.
                </p>
            </div>
        </div>
    );
};

export default CollaboratorQuickOrder;
