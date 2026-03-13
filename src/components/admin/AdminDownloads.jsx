import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Download, Trash2, X, Save, Upload, FileText } from 'lucide-react';
import './AdminCommon.css';

const AdminDownloads = () => {
    const [downloads, setDownloads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDownload, setEditingDownload] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'catalog',
        is_active: true
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);

    useEffect(() => {
        fetchDownloads();
    }, []);

    const fetchDownloads = async () => {
        try {
            const response = await api.get('/downloads');
            setDownloads(response.data.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch downloads:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);

        // Set preview info
        setFilePreview({
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
            type: file.type
        });

        // Auto-fill title if empty
        if (!formData.title) {
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
            setFormData(prev => ({ ...prev, title: nameWithoutExt }));
        }
    };

    const handleCreate = () => {
        setEditingDownload(null);
        setFormData({
            title: '',
            description: '',
            category: 'catalog',
            is_active: true
        });
        setSelectedFile(null);
        setFilePreview(null);
        setShowModal(true);
    };

    const handleEdit = (download) => {
        setEditingDownload(download);
        setFormData({
            title: download.title || '',
            description: download.description || '',
            category: download.category || 'catalog',
            is_active: download.is_active !== false
        });
        setSelectedFile(null);
        setFilePreview({
            name: download.file_name || download.filename || 'Existing file',
            size: download.file_size || 'Unknown',
            type: download.file_type || download.mime_type || 'Unknown'
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;

        try {
            await api.delete(`/downloads/${id}`);
            setDownloads(prev => prev.filter(download => download.id !== id));
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        } catch (error) {
            console.error('Failed to delete download:', error);
            if (error.response?.status === 500) {
                alert('Database Error: This file might be linked to other records and cannot be deleted.');
            } else {
                alert(error.response?.data?.message || 'Failed to delete file. Please try again.');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected files?`)) return;

        setIsBulkDeleting(true);
        try {
            await api.post('/bulk-delete', {
                ids: selectedIds,
                type: 'downloads'
            });
            setDownloads(prev => prev.filter(item => !selectedIds.includes(item.id)));
            setSelectedIds([]);
            alert('Selected files deleted successfully.');
        } catch (error) {
            console.error('Failed to bulk delete downloads:', error);
            if (error.response?.status === 500) {
                alert('Database Error: Some selected files are likely protected by database constraints.');
            } else {
                alert(error.response?.data?.message || 'Failed to bulk delete files.');
            }
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === downloads.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(downloads.map(d => d.id));
        }
    };

    const toggleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('category', formData.category);
        data.append('is_active', formData.is_active ? 1 : 0);

        if (selectedFile) {
            data.append('file', selectedFile);
        }

        try {
            if (editingDownload) {
                await api.post(`/downloads/${editingDownload.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/downloads', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            await fetchDownloads();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Failed to save download:', error);
            const errorMsg = error.response?.data?.message || 'Failed to save file.';
            const errorDetails = error.response?.data?.errors ? JSON.stringify(error.response.data.errors, null, 2) : '';
            alert(`Failed to save file.\n\n${errorMsg}\n\n${errorDetails}`);
        }
    };

    const handleDownload = (download) => {
        const fileUrl = download.file_path || download.file_url;
        if (fileUrl) {
            window.open(fileUrl, '_blank');
        } else {
            alert('File URL not available');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: 'catalog',
            is_active: true
        });
        setSelectedFile(null);
        setFilePreview(null);
        setEditingDownload(null);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown';
        if (typeof bytes === 'string') return bytes;
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };

    const getCategoryLabel = (category) => {
        const labels = {
            catalog: 'Catalog',
            manual: 'Manual',
            specification: 'Specification',
            brochure: 'Brochure',
            other: 'Other'
        };
        return labels[category] || category;
    };

    if (isLoading) return <div className="admin-loading">Loading downloads...</div>;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>Download Center</h1>
                    <span className="count-badge">{downloads.length} Files</span>
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
                        <Plus size={18} /> Upload File
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
                                    checked={downloads.length > 0 && selectedIds.length === downloads.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>File Name</th>
                            <th>Size</th>
                            <th>Uploaded</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {downloads.length > 0 ? (
                            downloads.map(download => (
                                <tr key={download.id} className={selectedIds.includes(download.id) ? 'selected-row' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(download.id)}
                                            onChange={() => toggleSelectOne(download.id)}
                                        />
                                    </td>
                                    <td>#{download.id}</td>
                                    <td>
                                        <strong>{download.title}</strong>
                                        {download.description && (
                                            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                {download.description.substring(0, 50)}
                                                {download.description.length > 50 && '...'}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className="status-badge">{getCategoryLabel(download.category)}</span>
                                    </td>
                                    <td>{download.file_name || download.filename || 'N/A'}</td>
                                    <td>{formatFileSize(download.file_size)}</td>
                                    <td>{download.created_at ? new Date(download.created_at).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge ${download.is_active ? 'active' : 'inactive'}`}>
                                            {download.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button onClick={() => handleDownload(download)} className="btn-action" title="Download">
                                                <Download size={16} />
                                            </button>
                                            <button onClick={() => handleEdit(download)} className="btn-action edit">
                                                <FileText size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(download.id)} className="btn-action delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                                    No files uploaded. Upload your first file for collaborators!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Upload Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <button className="modal-close" onClick={closeModal}>
                            <X size={24} />
                        </button>

                        <div className="modal-header">
                            <Upload size={24} />
                            <h2>{editingDownload ? 'Edit Download' : 'Upload New File'}</h2>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>File Upload*</label>
                                <input
                                    type="file"
                                    id="file-upload"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                    required={!editingDownload}
                                />
                                <label htmlFor="file-upload" className="upload-btn">
                                    <Upload size={18} /> Choose File
                                </label>
                                <small>PDF, DOC, ZIP, or any document type</small>
                            </div>

                            {filePreview && (
                                <div className="product-info-card">
                                    <h4>Selected File</h4>
                                    <div className="info-row">
                                        <span className="label">Name:</span>
                                        <span className="value">{filePreview.name}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Size:</span>
                                        <span className="value">{filePreview.size}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Type:</span>
                                        <span className="value">{filePreview.type}</span>
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Title*</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g. Product Catalog 2026"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows="3"
                                    placeholder="Brief description of the file..."
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label>Category*</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    required
                                >
                                    <option value="catalog">Catalog</option>
                                    <option value="manual">Manual</option>
                                    <option value="specification">Specification</option>
                                    <option value="brochure">Brochure</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                    />
                                    <span>File is Active (visible to collaborators)</span>
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    <Save size={18} /> {editingDownload ? 'Update' : 'Upload'}
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

export default AdminDownloads;
