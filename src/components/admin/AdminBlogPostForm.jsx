import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import './AdminForm.css';
import { ArrowLeft, Save, Upload, Loader, X, Image as ImageIcon } from 'lucide-react';

const AdminBlogPostForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        author: '',
        category_id: '',
        is_active: 0,
        published_at: ''
    });

    const [featuredImage, setFeaturedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCategories();
        if (isEditMode) {
            fetchPost();
        }
    }, [id, isEditMode]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories?type=blog');
            setCategories(response.data.data || response.data || []);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    };

    const fetchPost = async () => {
        try {
            const response = await api.get(`/posts/${id}`);
            const post = response.data.data || response.data;
            setFormData({
                title: post.title || '',
                excerpt: post.excerpt || '',
                content: post.content || '',
                author: post.author || '',
                category_id: post.category?.id || post.category_id || '',
                is_active: post.is_active || 0,
                published_at: post.published_at ? post.published_at.split('T')[0] : ''
            });

            if (post.thumbnail) {
                setImagePreview(getImageUrl(post.thumbnail));
            }
        } catch (err) {
            console.error("Failed to fetch post", err);
            setError("Failed to load blog post.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        }));
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFeaturedImage(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setFeaturedImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const data = new FormData();

        data.append('type', 'blog');
        data.append('title', formData.title);
        data.append('excerpt', formData.excerpt || '');
        data.append('content', formData.content);
        data.append('author', formData.author || '');
        data.append('is_active', formData.is_active);

        if (formData.category_id) {
            data.append('category_id', formData.category_id);
        }

        if (formData.published_at) {
            data.append('published_at', formData.published_at);
        }

        if (featuredImage) {
            data.append('thumbnail', featuredImage);
        }

        try {
            if (isEditMode) {
                data.append('_method', 'PUT');
                await api.post(`/posts/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/posts', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            navigate('/admin/blog');
        } catch (err) {
            console.error("Failed to save post", err);
            const errorMsg = err.response?.data?.message || "Failed to save blog post.";
            const errorDetails = err.response?.data?.errors ? JSON.stringify(err.response.data.errors, null, 2) : '';
            setError(errorDetails ? `${errorMsg}\n${errorDetails}` : errorMsg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="admin-loading-state">
            <Loader className="spin" /> Loading Post...
        </div>
    );

    return (
        <div className="admin-page fade-in">
            <div className="admin-header">
                <div className="header-left">
                    <button onClick={() => navigate('/admin/blog')} className="back-btn">
                        <ArrowLeft size={20} />
                    </button>
                    <h1>{isEditMode ? 'Edit Blog Post' : 'Write New Post'}</h1>
                </div>
            </div>

            <div className="admin-form-wrapper">
                {error && <div className="error-message"><pre>{error}</pre></div>}

                <form onSubmit={handleSubmit} className="admin-form-grid">
                    <div className="form-main">
                        <div className="form-card">
                            <h3>Post Content</h3>
                            <div className="form-group">
                                <label>Title*</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter post title"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Excerpt</label>
                                <textarea
                                    name="excerpt"
                                    value={formData.excerpt}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Brief summary of the post (shown in listings)"
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label>Content*</label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    rows="15"
                                    placeholder="Write your blog post content here..."
                                    required
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="form-sidebar">
                        <div className="form-card">
                            <h3>Post Settings</h3>

                            <div className="form-group">
                                <label>Author</label>
                                <input
                                    type="text"
                                    name="author"
                                    value={formData.author}
                                    onChange={handleChange}
                                    placeholder="Author name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.title || cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Published Date</label>
                                <input
                                    type="date"
                                    name="published_at"
                                    value={formData.published_at}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active === 1}
                                        onChange={handleChange}
                                    />
                                    <span>Publish this post</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-card">
                            <h3>Featured Image</h3>
                            <div className="form-group">
                                <input
                                    type="file"
                                    id="featured-image-upload"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="featured-image-upload" className="upload-btn">
                                    <ImageIcon size={18} /> Choose Image
                                </label>
                                <small>Recommended: 1200x630px</small>
                            </div>

                            {imagePreview && (
                                <div className="image-preview">
                                    <button type="button" className="remove-img" onClick={removeImage}>
                                        <X size={16} />
                                    </button>
                                    <img src={imagePreview} alt="Featured" />
                                </div>
                            )}
                        </div>

                        <div className="form-actions-card">
                            <button type="submit" className="btn-primary full-width" disabled={saving}>
                                {saving ? <><Loader size={18} className="spin" /> Saving...</> : <><Save size={18} /> {isEditMode ? 'Update' : 'Publish'} Post</>}
                            </button>
                            <button type="button" className="btn-secondary full-width" onClick={() => navigate('/admin/blog')}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminBlogPostForm;
