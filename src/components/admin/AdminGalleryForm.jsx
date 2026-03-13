import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import getImageUrl from '../../utils/imageUrl';
import './AdminForm.css';
import { ArrowLeft, Save, Upload, Loader, X, Image as ImageIcon, Trash2 } from 'lucide-react';

const AdminGalleryForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        category_id: ''
    });

    const [newImages, setNewImages] = useState([]); // Files to upload
    const [imagePreviews, setImagePreviews] = useState([]); // Previews for new files
    const [existingImages, setExistingImages] = useState([]); // Images already in API
    const [imagesToDelete, setImagesToDelete] = useState([]); // IDs of existing images to delete

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCategories();
        if (isEditMode) {
            fetchGallery();
        }
    }, [id, isEditMode]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories?type=gallery');
            setCategories(response.data.data || response.data || []);
        } catch (err) {
            console.error("Failed to fetch gallery categories", err);
        }
    };

    const fetchGallery = async () => {
        try {
            const response = await api.get(`/galleries/${id}`);
            const gallery = response.data.data || response.data;
            setFormData({
                title: gallery.title || '',
                category_id: gallery.category_id || gallery.category?.id || ''
            });

            if (gallery.images) {
                setExistingImages(gallery.images);
            }
        } catch (err) {
            console.error("Failed to fetch gallery", err);
            setError("Failed to load gallery details.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setNewImages(prev => [...prev, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, { file, url: reader.result }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeNewImage = (index) => {
        const fileToRemove = imagePreviews[index].file;
        setNewImages(prev => prev.filter(f => f !== fileToRemove));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const markExistingForDeletion = (imageId) => {
        setImagesToDelete(prev => [...prev, imageId]);
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('category_id', formData.category_id);

        // Add index notation if backend expects it, or just multiple 'images[]'
        newImages.forEach(file => {
            data.append('images[]', file);
        });

        // Backend handling for deletion: usually sent as an array of IDs to remove
        if (imagesToDelete.length > 0) {
            imagesToDelete.forEach(id => {
                data.append('deleted_image_ids[]', id);
            });
        }

        try {
            if (isEditMode) {
                // Many Laravel backends require _method=PUT for multipart/form-data PUT requests
                data.append('_method', 'PUT');
                await api.post(`/galleries/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/galleries', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            navigate('/admin/gallery');
        } catch (err) {
            console.error("Failed to save gallery", err);
            setError(err.response?.data?.message || "Failed to save gallery.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="admin-loading-state">
            <Loader className="spin" /> Loading Gallery...
        </div>
    );

    return (
        <div className="admin-page fade-in">
            <div className="admin-header">
                <div className="header-left">
                    <button onClick={() => navigate('/admin/gallery')} className="back-btn">
                        <ArrowLeft size={20} />
                    </button>
                    <h1>{isEditMode ? 'Edit Gallery' : 'Add New Gallery'}</h1>
                </div>
            </div>

            <div className="admin-form-wrapper">
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="admin-form-grid">
                    <div className="form-main">
                        <div className="form-card">
                            <h3>Gallery Information</h3>
                            <div className="form-group">
                                <label>Gallery Title*</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Modern Kitchen Project"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Category*</label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.title || cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-card">
                            <h3>Gallery Images</h3>
                            <div className="gallery-upload-zone">
                                <input
                                    type="file"
                                    id="gallery-images"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="gallery-images" className="upload-placeholder">
                                    <Upload size={48} />
                                    <span>Click to upload multiple images</span>
                                    <small>JPG, PNG or WEBP (Max 5MB each)</small>
                                </label>
                            </div>

                            <div className="image-previews-grid">
                                {/* Existing Images */}
                                {existingImages.map((img) => (
                                    <div key={img.id} className="preview-item">
                                        <img src={getImageUrl(img.image_path)} alt="Existing" />
                                        <button
                                            type="button"
                                            className="remove-preview"
                                            onClick={() => markExistingForDeletion(img.id)}
                                            title="Remove image"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <span className="badge-existing">Existing</span>
                                    </div>
                                ))}

                                {/* New Image Previews */}
                                {imagePreviews.map((preview, idx) => (
                                    <div key={idx} className="preview-item">
                                        <img src={preview.url} alt={`New ${idx}`} />
                                        <button
                                            type="button"
                                            className="remove-preview"
                                            onClick={() => removeNewImage(idx)}
                                            title="Remove image"
                                        >
                                            <X size={16} />
                                        </button>
                                        <span className="badge-new">New</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-sidebar">
                        <div className="form-actions-card">
                            <button type="submit" className="btn-primary full-width" disabled={saving}>
                                {saving ? <><Loader size={18} className="spin" /> Saving...</> : <><Save size={18} /> Save Gallery</>}
                            </button>
                            <button type="button" className="btn-secondary full-width" onClick={() => navigate('/admin/gallery')}>
                                Cancel
                            </button>
                        </div>

                        <div className="form-card">
                            <h3>Stats</h3>
                            <p><strong>Total Images:</strong> {existingImages.length + newImages.length}</p>
                            <p><strong>Existing:</strong> {existingImages.length}</p>
                            <p><strong>To Upload:</strong> {newImages.length}</p>
                            {imagesToDelete.length > 0 && (
                                <p style={{ color: '#d93025' }}><strong>To Delete:</strong> {imagesToDelete.length}</p>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .gallery-upload-zone {
                    border: 2px dashed #ddd;
                    border-radius: 8px;
                    padding: 40px;
                    text-align: center;
                    margin-bottom: 20px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .gallery-upload-zone:hover {
                    border-color: #EC4E15;
                    background: #fff8f6;
                }
                .upload-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    color: #666;
                }
                .image-previews-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 15px;
                }
                .preview-item {
                    position: relative;
                    aspect-ratio: 1;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 1px solid #eee;
                }
                .preview-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .remove-preview {
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background: rgba(255, 255, 255, 0.9);
                    border: none;
                    border-radius: 4px;
                    padding: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .remove-preview:hover {
                    background: #fee;
                    color: #d93025;
                }
                .badge-new, .badge-existing {
                    position: absolute;
                    bottom: 5px;
                    left: 5px;
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .badge-new { background: #e6f4ea; color: #1e8e3e; }
                .badge-existing { background: #e8f0fe; color: #1a73e8; }
            `}} />
        </div>
    );
};

export default AdminGalleryForm;
