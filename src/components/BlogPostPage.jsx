import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import getImageUrl from '../utils/imageUrl';
import './BlogPostPage.css';

const BlogPostPage = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/posts/${id}`);
                setPost(res.data);
                window.scrollTo(0, 0);
            } catch (err) {
                console.error("Failed to fetch blog post", err);
                setError("Could not load the story. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="blog-post-loading">
                <div className="loading-spinner"></div>
                <span>Opening Journal...</span>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="blog-post-error">
                <h2>{error || "Story not found"}</h2>
                <Link to="/blog" className="back-to-blog-btn">&larr; Back to Journal</Link>
            </div>
        );
    }

    return (
        <div className="blog-post-page fade-in">
            <div className="blog-post-hero">
                {post.thumbnail && (
                    <img 
                        src={getImageUrl(post.thumbnail)} 
                        alt={post.title} 
                        className="blog-hero-image" 
                    />
                )}
                <div className="blog-hero-overlay">
                    <div className="blog-hero-content">
                        <span className="blog-post-category">
                            {post.category?.title || post.category?.name || "Updates"}
                        </span>
                        <h1 className="blog-post-title">{post.title}</h1>
                        <span className="blog-post-date">
                            {formatDate(post.published_at || post.created_at)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="blog-post-container">
                <article className="blog-post-body">
                    {post.excerpt && <p className="blog-lead-text">{post.excerpt}</p>}
                    
                    <div 
                        className="blog-content-rich"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    <div className="blog-post-navigation">
                        <Link to="/blog" className="back-to-blog-btn">
                            &larr; Back to Journal
                        </Link>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default BlogPostPage;
