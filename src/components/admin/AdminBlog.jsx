import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Eye, FileText } from 'lucide-react';
import './AdminCommon.css';

const AdminBlog = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts?type=blog&all=1');
            setPosts(response.data.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch blog posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        navigate('/admin/blog/new');
    };

    const handleEdit = (id) => {
        navigate(`/admin/blog/${id}/edit`);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this blog post?')) return;

        try {
            await api.delete(`/posts/${id}`);
            setPosts(prev => prev.filter(post => post.id !== id));
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        } catch (error) {
            console.error('Failed to delete post:', error);
            if (error.response?.status === 500) {
                alert('Database Error: This post might be linked to other resources and cannot be deleted.');
            } else {
                alert(error.response?.data?.message || 'Failed to delete blog post. Please try again.');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected posts?`)) return;

        setIsBulkDeleting(true);
        try {
            await api.post('/bulk-delete', {
                ids: selectedIds,
                type: 'posts'
            });
            setPosts(prev => prev.filter(post => !selectedIds.includes(post.id)));
            setSelectedIds([]);
            alert('Selected posts deleted successfully.');
        } catch (error) {
            console.error('Failed to bulk delete posts:', error);
            if (error.response?.status === 500) {
                alert('Database Error: Some selected posts might be protected by database constraints.');
            } else {
                alert(error.response?.data?.message || 'Failed to bulk delete posts. Please try again.');
            }
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === posts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(posts.map(p => p.id));
        }
    };

    const toggleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleView = (id) => {
        window.open(`/blog/${id}`, '_blank');
    };

    if (isLoading) return <div className="admin-loading">Loading blog posts...</div>;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>Blog Management</h1>
                    <span className="count-badge">{posts.length} Posts</span>
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
                        <Plus size={18} /> Write New Post
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
                                    checked={posts.length > 0 && selectedIds.length === posts.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Author</th>
                            <th>Published</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <tr key={post.id} className={selectedIds.includes(post.id) ? 'selected-row' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(post.id)}
                                            onChange={() => toggleSelectOne(post.id)}
                                        />
                                    </td>
                                    <td>#{post.id}</td>
                                    <td>
                                        <strong>{post.title}</strong>
                                        {post.excerpt && (
                                            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                {post.excerpt.substring(0, 60)}...
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className="status-badge">
                                            {post.category?.title || post.category?.name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td>{post.author || 'Admin'}</td>
                                    <td>{post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not published'}</td>
                                    <td>
                                        <span className={`status-badge ${post.is_active ? 'active' : 'inactive'}`}>
                                            {post.is_active ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button onClick={() => handleView(post.id)} className="btn-action" title="View">
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => handleEdit(post.id)} className="btn-action edit" title="Edit">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(post.id)} className="btn-action delete" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                                    No blog posts found. Write your first post!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminBlog;
