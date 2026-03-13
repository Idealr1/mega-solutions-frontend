import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, X, Save, Tag, Percent, DollarSign } from 'lucide-react';
import './AdminCommon.css';

const AdminOffers = () => {
    const [offers, setOffers] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const [formData, setFormData] = useState({
        product_id: '',
        price_type: 'regular',
        discount_type: 'percentage',
        discount_value: '',
        valid_from: '',
        valid_until: '',
        is_active: true
    });

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [calculatedPrice, setCalculatedPrice] = useState(null);

    useEffect(() => {
        fetchOffers();
        fetchProducts();
    }, []);

    const fetchOffers = async () => {
        try {
            const response = await api.get('/offers');
            setOffers(response.data.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch offers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    const handleProductSelect = (e) => {
        const productId = e.target.value;
        setFormData(prev => ({ ...prev, product_id: productId }));

        const product = products.find(p => p.id === parseInt(productId));
        setSelectedProduct(product);

        // Recalculate with existing discount if any
        if (product && formData.discount_value) {
            calculateOfferPrice(product, formData.price_type, formData.discount_type, formData.discount_value);
        } else {
            setCalculatedPrice(null);
        }
    };

    const handleDiscountChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, discount_value: value }));

        if (selectedProduct && value) {
            calculateOfferPrice(selectedProduct, formData.price_type, formData.discount_type, value);
        } else {
            setCalculatedPrice(null);
        }
    };

    const handleDiscountTypeChange = (e) => {
        const discountType = e.target.value;
        setFormData(prev => ({ ...prev, discount_type: discountType }));

        if (selectedProduct && formData.discount_value) {
            calculateOfferPrice(selectedProduct, formData.price_type, discountType, formData.discount_value);
        }
    };

    const handlePriceTypeChange = (e) => {
        const priceType = e.target.value;
        setFormData(prev => ({ ...prev, price_type: priceType }));

        if (selectedProduct && formData.discount_value) {
            calculateOfferPrice(selectedProduct, priceType, formData.discount_type, formData.discount_value);
        }
    };

    const calculateOfferPrice = (product, priceType, discountType, discountValue) => {
        const originalPrice = priceType === 'collaborator'
            ? parseFloat(product.collaborator_price || product.regular_price || 0)
            : parseFloat(product.regular_price || 0);

        let offerPrice = 0;
        let savings = 0;
        let discountPercent = 0;

        if (discountType === 'percentage') {
            const percent = parseFloat(discountValue) || 0;
            savings = (originalPrice * percent) / 100;
            offerPrice = originalPrice - savings;
            discountPercent = percent;
        } else {
            // Fixed amount
            savings = parseFloat(discountValue) || 0;
            offerPrice = originalPrice - savings;
            discountPercent = originalPrice > 0 ? (savings / originalPrice * 100) : 0;
        }

        setCalculatedPrice({
            original: originalPrice,
            offer: Math.max(0, offerPrice),
            savings: savings,
            discountPercent: discountPercent.toFixed(2)
        });
    };

    const handleCreate = () => {
        setEditingOffer(null);
        setFormData({
            product_id: '',
            price_type: 'regular',
            discount_type: 'percentage',
            discount_value: '',
            valid_from: new Date().toISOString().split('T')[0],
            valid_until: '',
            is_active: true
        });
        setSelectedProduct(null);
        setCalculatedPrice(null);
        setShowModal(true);
    };

    const handleEdit = (offer) => {
        setEditingOffer(offer);

        const product = products.find(p => p.id === (offer.product_id || offer.product?.id));
        setSelectedProduct(product);

        setFormData({
            product_id: offer.product_id || offer.product?.id || '',
            price_type: offer.price_type || 'regular',
            discount_type: offer.discount_type || 'percentage',
            discount_value: offer.discount_value || '',
            valid_from: offer.valid_from ? offer.valid_from.split('T')[0] : '',
            valid_until: offer.valid_until ? offer.valid_until.split('T')[0] : '',
            is_active: offer.is_active !== false
        });

        if (product && offer.discount_value) {
            calculateOfferPrice(
                product,
                offer.price_type || 'regular',
                offer.discount_type || 'percentage',
                offer.discount_value
            );
        }

        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this offer?')) return;

        try {
            await api.delete(`/offers/${id}`);
            setOffers(prev => prev.filter(offer => offer.id !== id));
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        } catch (error) {
            console.error('Failed to delete offer:', error);
            if (error.response?.status === 500) {
                alert('Database Error: This offer might be linked to other records and cannot be deleted.');
            } else {
                alert(error.response?.data?.message || 'Failed to delete offer. Please try again.');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected offers?`)) return;

        setIsBulkDeleting(true);
        try {
            await api.post('/bulk-delete', {
                ids: selectedIds,
                type: 'offers'
            });
            setOffers(prev => prev.filter(item => !selectedIds.includes(item.id)));
            setSelectedIds([]);
            alert('Selected offers deleted successfully.');
        } catch (error) {
            console.error('Failed to bulk delete offers:', error);
            if (error.response?.status === 500) {
                alert('Database Error: One or more selected offers are protected by database constraints.');
            } else {
                alert(error.response?.data?.message || 'Failed to bulk delete offers.');
            }
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === offers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(offers.map(o => o.id));
        }
    };

    const toggleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!calculatedPrice) {
            alert('Please select a product and enter a discount value');
            return;
        }

        try {
            const payload = {
                product_id: parseInt(formData.product_id),
                title: selectedProduct?.title || 'Special Offer',
                price_type: formData.price_type,
                discount_type: formData.discount_type,
                discount_value: parseFloat(formData.discount_value),
                offer_price: calculatedPrice.offer,
                valid_from: formData.valid_from || null,
                valid_until: formData.valid_until || null,
                is_active: formData.is_active ? 1 : 0
            };

            if (editingOffer) {
                await api.put(`/offers/${editingOffer.id}`, payload);
            } else {
                await api.post('/offers', payload);
            }

            await fetchOffers();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Failed to save offer:', error);
            const errorMsg = error.response?.data?.message || 'Failed to save offer.';
            const errorDetails = error.response?.data?.errors ? JSON.stringify(error.response.data.errors, null, 2) : '';
            alert(`Failed to save offer.\n\n${errorMsg}\n\n${errorDetails}`);
        }
    };

    const resetForm = () => {
        setFormData({
            product_id: '',
            price_type: 'regular',
            discount_type: 'percentage',
            discount_value: '',
            valid_from: '',
            valid_until: '',
            is_active: true
        });
        setSelectedProduct(null);
        setCalculatedPrice(null);
        setEditingOffer(null);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const getOfferDetails = (offer) => {
        const product = offer.product || products.find(p => p.id === offer.product_id);
        const originalPrice = offer.price_type === 'collaborator'
            ? parseFloat(product?.collaborator_price || product?.regular_price || 0)
            : parseFloat(product?.regular_price || 0);

        const offerPrice = parseFloat(offer.offer_price || 0);
        const savings = originalPrice - offerPrice;
        const discountPercent = originalPrice > 0 ? ((savings / originalPrice) * 100).toFixed(0) : 0;

        return { product, originalPrice, offerPrice, savings, discountPercent };
    };

    if (isLoading) return <div className="admin-loading">Loading offers...</div>;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>Special Offers</h1>
                    <span className="count-badge">{offers.length} Offers</span>
                </div>
                <div className="header-actions">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="btn-danger"
                            disabled={isBulkDeleting}
                            style={{ marginRight: '10px' }}
                        >
                            {isBulkDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
                        </button>
                    )}
                    <button onClick={handleCreate} className="btn-primary">
                        <Plus size={18} /> New Offer
                    </button>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <input
                                    type="checkbox"
                                    checked={offers.length > 0 && selectedIds.length === offers.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th>ID</th>
                            <th>Product</th>
                            <th>Discount</th>
                            <th>Original Price</th>
                            <th>Offer Price</th>
                            <th>Savings</th>
                            <th>Valid Until</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {offers.length > 0 ? (
                            offers.map(offer => {
                                const { product, originalPrice, offerPrice, savings, discountPercent } = getOfferDetails(offer);

                                return (
                                    <tr key={offer.id} className={selectedIds.includes(offer.id) ? 'selected-row' : ''}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(offer.id)}
                                                onChange={() => toggleSelectOne(offer.id)}
                                            />
                                        </td>
                                        <td>#{offer.id}</td>
                                        <td>
                                            <strong>{product?.title || offer.title || 'Unknown Product'}</strong>
                                            {offer.price_type === 'collaborator' && (
                                                <span style={{ marginLeft: '8px', fontSize: '11px', background: '#17a2b8', color: 'white', padding: '2px 6px', borderRadius: '3px' }}>
                                                    Collaborator
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {offer.discount_type === 'percentage' ? (
                                                <span className="discount-badge">
                                                    <Percent size={12} /> {offer.discount_value}%
                                                </span>
                                            ) : (
                                                <span className="discount-badge">
                                                    <DollarSign size={12} /> ${parseFloat(offer.discount_value).toFixed(2)}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ textDecoration: 'line-through', color: '#999' }}>
                                            ${originalPrice.toFixed(2)}
                                        </td>
                                        <td className="price-highlight" style={{ fontWeight: '700', fontSize: '16px' }}>
                                            ${offerPrice.toFixed(2)}
                                        </td>
                                        <td style={{ color: '#28a745', fontWeight: '600' }}>
                                            Save ${savings.toFixed(2)} ({discountPercent}%)
                                        </td>
                                        <td>{offer.valid_until ? new Date(offer.valid_until).toLocaleDateString() : 'No expiry'}</td>
                                        <td>
                                            <span className={`status-badge ${offer.is_active ? 'active' : 'inactive'}`}>
                                                {offer.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button onClick={() => handleEdit(offer)} className="btn-action edit" title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(offer.id)} className="btn-action delete" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>
                                    No offers found. Create your first special offer!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Offer Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <button className="modal-close" onClick={closeModal}>
                            <X size={24} />
                        </button>

                        <div className="modal-header">
                            <Tag size={24} />
                            <h2>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</h2>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Select Product*</label>
                                <select
                                    value={formData.product_id}
                                    onChange={handleProductSelect}
                                    required
                                >
                                    <option value="">Choose a product...</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.title} - Regular: ${parseFloat(product.regular_price || 0).toFixed(2)}
                                            {product.collaborator_price && ` | Collaborator: $${parseFloat(product.collaborator_price).toFixed(2)}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Target Customer Type*</label>
                                    <select
                                        value={formData.price_type}
                                        onChange={handlePriceTypeChange}
                                        required
                                    >
                                        <option value="regular">Regular Customers</option>
                                        <option value="collaborator">Collaborators/Partners</option>
                                    </select>
                                </div>
                                <div className="form-group half">
                                    <label>Discount Type*</label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={handleDiscountTypeChange}
                                        required
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount ($)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>
                                    {formData.discount_type === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount ($)'}*
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max={formData.discount_type === 'percentage' ? '100' : undefined}
                                    value={formData.discount_value}
                                    onChange={handleDiscountChange}
                                    placeholder={formData.discount_type === 'percentage' ? 'e.g. 20' : 'e.g. 50.00'}
                                    required
                                    disabled={!selectedProduct}
                                />
                                <small>
                                    {formData.discount_type === 'percentage'
                                        ? 'Enter percentage (0-100)'
                                        : 'Enter fixed discount amount'}
                                </small>
                            </div>

                            {selectedProduct && calculatedPrice && (
                                <div className="product-info-card">
                                    <h4>Offer Preview</h4>
                                    <div className="info-row">
                                        <span className="label">Product:</span>
                                        <span className="value">{selectedProduct.title}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Original Price:</span>
                                        <span className="value price-original">${calculatedPrice.original.toFixed(2)}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Discount:</span>
                                        <span className="value discount-value">
                                            {formData.discount_type === 'percentage'
                                                ? `${formData.discount_value}%`
                                                : `$${parseFloat(formData.discount_value).toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Offer Price:</span>
                                        <span className="value price-offer">${calculatedPrice.offer.toFixed(2)}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Customer Saves:</span>
                                        <span className="value" style={{ color: '#28a745', fontWeight: '700' }}>
                                            ${calculatedPrice.savings.toFixed(2)} ({calculatedPrice.discountPercent}%)
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Valid From</label>
                                    <input
                                        type="date"
                                        value={formData.valid_from}
                                        onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group half">
                                    <label>Valid Until</label>
                                    <input
                                        type="date"
                                        value={formData.valid_until}
                                        onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                    />
                                    <span>Offer is Active</span>
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    <Save size={18} /> Save Offer
                                </button>
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOffers;
