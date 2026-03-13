import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, X, Save, Folder } from 'lucide-react';
import './AdminCommon.css';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const [formData, setFormData] = useState({
        type: 'product',
        title: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingCategory(null);
        setFormData({ type: 'product', title: '' });
        setShowModal(true);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            type: category.type || 'product',
            title: category.title || category.name || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            await api.delete(`/categories/${id}`);
            setCategories(prev => prev.filter(cat => cat.id !== id));
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        } catch (error) {
            console.error('Failed to delete category:', error);
            if (error.response?.status === 500) {
                alert('Database Error: This category cannot be deleted because it still contains products or blog posts. Please move or delete the linked items first.');
            } else {
                alert(error.response?.data?.message || 'Failed to delete category. Please try again.');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected categories?`)) return;

        setIsBulkDeleting(true);
        try {
            await api.post('/bulk-delete', {
                ids: selectedIds,
                type: 'categories'
            });
            setCategories(prev => prev.filter(cat => !selectedIds.includes(cat.id)));
            setSelectedIds([]);
            alert('Selected categories deleted successfully.');
        } catch (error) {
            console.error('Failed to bulk delete categories:', error);
            if (error.response?.status === 500) {
                alert('Database Error: One or more categories contain active products or blogs. Empty the categories before deleting them.');
            } else {
                alert(error.response?.data?.message || 'Failed to bulk delete categories. Please try again.');
            }
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === categories.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(categories.map(c => c.id));
        }
    };

    const toggleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingCategory) {
                const response = await api.put(`/categories/${editingCategory.id}`, formData);
                setCategories(prev => prev.map(cat =>
                    cat.id === editingCategory.id ? (response.data.data || response.data) : cat
                ));
            } else {
                const response = await api.post('/categories', formData);
                setCategories(prev => [...prev, response.data.data || response.data]);
            }
            setShowModal(false);
            setFormData({ type: 'product', title: '' });
        } catch (error) {
            console.error('Failed to save category:', error);
            alert('Failed to save category. Please try again.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ type: 'product', title: '' });
        setEditingCategory(null);
    };

    const getCategoryTypeLabel = (type) => {
        const labels = {
            product: 'Product',
            blog: 'Blog',
            news: 'News',
            gallery: 'Gallery'
        };
        return labels[type] || type;
    };

    if (isLoading) return <div className="admin-loading">Loading categories...</div>;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>Categories</h1>
                    <span className="count-badge">{categories.length} Categories</span>
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
                        <Plus size={18} /> New Category
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
                                    checked={categories.length > 0 && selectedIds.length === categories.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length > 0 ? (
                            categories.map(category => (
                                <tr key={category.id} className={selectedIds.includes(category.id) ? 'selected-row' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(category.id)}
                                            onChange={() => toggleSelectOne(category.id)}
                                        />
                                    </td>
                                    <td>#{category.id}</td>
                                    <td><strong>{category.title || category.name}</strong></td>
                                    <td>
                                        <span className={`status-badge ${category.type}`}>
                                            {getCategoryTypeLabel(category.type)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button onClick={() => handleEdit(category)} className="btn-action edit" title="Edit">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(category.id)} className="btn-action delete" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                    No categories found. Create your first category!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Category Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content small-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>
                            <X size={24} />
                        </button>

                        <div className="modal-header">
                            <h2>{editingCategory ? 'Edit Category' : 'Create New Category'}</h2>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Category Type*</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="product">Product</option>
                                    <option value="blog">Blog</option>
                                    <option value="news">News</option>
                                    <option value="gallery">Gallery</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Title*</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Base Cabinets"
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    <Save size={18} /> Save Category
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

export default AdminCategories;
