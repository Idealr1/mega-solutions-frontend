import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Eye, Image as ImageIcon } from 'lucide-react';
import getImageUrl from '../../utils/imageUrl';
import './AdminCommon.css';

const AdminGallery = () => {
    const [galleries, setGalleries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchGalleries();
    }, []);

    const fetchGalleries = async () => {
        try {
            const response = await api.get('/galleries');
            setGalleries(response.data.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch galleries:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        navigate('/admin/gallery/new');
    };

    const handleEdit = (id) => {
        navigate(`/admin/gallery/${id}/edit`);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this gallery?')) return;

        try {
            await api.delete(`/galleries/${id}`);
            setGalleries(prev => prev.filter(g => g.id !== id));
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        } catch (error) {
            console.error('Failed to delete gallery:', error);
            alert(error.response?.data?.message || 'Failed to delete gallery. Please try again.');
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected galleries?`)) return;

        setIsBulkDeleting(true);
        try {
            await api.post('/bulk-delete', {
                ids: selectedIds,
                type: 'galleries'
            });
            setGalleries(prev => prev.filter(g => !selectedIds.includes(g.id)));
            setSelectedIds([]);
            alert('Selected galleries deleted successfully.');
        } catch (error) {
            console.error('Failed to bulk delete galleries:', error);
            alert(error.response?.data?.message || 'Failed to bulk delete galleries. Please try again.');
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === galleries.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(galleries.map(g => g.id));
        }
    };

    const toggleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (isLoading) return <div className="admin-loading">Loading galleries...</div>;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>Gallery Management</h1>
                    <span className="count-badge">{galleries.length} Galleries</span>
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
                        <Plus size={18} /> Add New Gallery
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
                                    checked={galleries.length > 0 && selectedIds.length === galleries.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th>ID</th>
                            <th>Preview</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Images</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {galleries.length > 0 ? (
                            galleries.map(gallery => (
                                <tr key={gallery.id} className={selectedIds.includes(gallery.id) ? 'selected-row' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(gallery.id)}
                                            onChange={() => toggleSelectOne(gallery.id)}
                                        />
                                    </td>
                                    <td>#{gallery.id}</td>
                                    <td>
                                        <div className="admin-table-img">
                                            {gallery.images && gallery.images.length > 0 ? (
                                                <img
                                                    src={getImageUrl(gallery.images[0].image_path)}
                                                    alt={gallery.title}
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            ) : (
                                                <div className="no-image-placeholder">
                                                    <ImageIcon size={20} />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td><strong>{gallery.title}</strong></td>
                                    <td>
                                        <span className="status-badge">
                                            {gallery.category?.title || gallery.category?.name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td>{gallery.images?.length || 0} images</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button onClick={() => handleEdit(gallery.id)} className="btn-action edit" title="Edit">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(gallery.id)} className="btn-action delete" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                    No galleries found. Create your first gallery!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminGallery;
