import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Eye, Package } from 'lucide-react';
import getImageUrl from '../../utils/imageUrl';
import './AdminCommon.css';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            const productData = response.data.data || response.data || [];
            console.log('Products from API:', productData);
            if (productData.length > 0) {
                console.log('First product:', productData[0]);
                console.log('First product thumbnail:', productData[0].thumbnail);
                console.log('First product images:', productData[0].images);
            }
            setProducts(productData);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        navigate('/admin/products/new');
    };

    const handleEdit = (id) => {
        navigate(`/admin/products/${id}/edit`);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product? This will also delete all its variants.')) return;

        try {
            await api.delete(`/products/${id}`);
            setProducts(prev => prev.filter(product => product.id !== id));
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        } catch (error) {
            console.error('Failed to delete product:', error);
            if (error.response?.status === 500) {
                alert('Database Error: This product might be linked to Orders or Quotes and cannot be deleted to protect historical data.');
            } else {
                alert(error.response?.data?.message || 'Failed to delete product. Please try again.');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected products?`)) return;

        setIsBulkDeleting(true);
        try {
            await api.post('/bulk-delete', {
                ids: selectedIds,
                type: 'products'
            });

            setProducts(prev => prev.filter(product => !selectedIds.includes(product.id)));
            setSelectedIds([]);
            alert('Selected products deleted successfully.');
        } catch (error) {
            console.error('Failed to bulk delete products:', error);
            if (error.response?.status === 500) {
                alert('Database Error: One or more selected products are likely linked to existing Orders or Quotes. Deletion blocked for data integrity.');
            } else if (error.response?.status === 422) {
                alert('Validation Error: The request payload was incorrect. Please contact developer.');
            } else {
                alert(error.response?.data?.message || 'Failed to bulk delete products. Please try again.');
            }
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === products.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(products.map(p => p.id));
        }
    };

    const toggleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleView = (id) => {
        window.open(`/products/${id}`, '_blank');
    };

    const getPriceRange = (product) => {
        if (!product.variants || product.variants.length === 0) {
            return `$${parseFloat(product.regular_price || 0).toFixed(2)}`;
        }

        const prices = product.variants.map(v => parseFloat(v.regular_price || 0));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        if (minPrice === maxPrice) {
            return `$${minPrice.toFixed(2)}`;
        }
        return `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
    };

    if (isLoading) return <div>Loading products...</div>;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>Product Catalog</h1>
                    <span className="count-badge">{products.length} Products</span>
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
                        <Plus size={18} /> Add New Product
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
                                    checked={products.length > 0 && selectedIds.length === products.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th>ID</th>
                            <th>Image</th>
                            <th>Product</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Variants</th>
                            <th>Price Range</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map(product => (
                                <tr key={product.id} className={selectedIds.includes(product.id) ? 'selected-row' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(product.id)}
                                            onChange={() => toggleSelectOne(product.id)}
                                        />
                                    </td>
                                    <td>#{product.id}</td>
                                    <td>
                                        <div className="product-thumb" style={{ width: '60px', height: '60px', overflow: 'hidden', borderRadius: '4px' }}>
                                            {product.thumbnail ? (
                                                <img
                                                    src={getImageUrl(product.thumbnail)}
                                                    alt={product.title}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Package size={24} color="#ccc" />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <strong>{product.title}</strong>
                                        {product.description && (
                                            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                {product.description.substring(0, 50)}...
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ textTransform: 'capitalize' }}>{product.type}</td>
                                    <td>{product.category?.title || product.category?.name || 'Uncategorized'}</td>
                                    <td>
                                        <span className="status-badge">
                                            {product.variant_count || product.variants?.length || 0} sizes
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: '600', color: '#ff6b00' }}>
                                        {getPriceRange(product)}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button onClick={() => handleView(product.id)} className="btn-action" title="View">
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => handleEdit(product.id)} className="btn-action edit" title="Edit">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(product.id)} className="btn-action delete" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>
                                    No products found. Add your first product!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProducts;
