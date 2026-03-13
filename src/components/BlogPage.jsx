import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import getImageUrl from '../utils/imageUrl';
import './BlogPage.css';
import leftArrow from '../assets/images/left.svg';
import rightArrow from '../assets/images/right.svg';

const BlogPage = () => {
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/posts?type=blog&page=${currentPage}`);
                const data = res.data.data || res.data || [];
                const meta = res.data.meta || {};

                setPosts(data);
                setTotalPages(meta.last_page || 1);
                window.scrollTo(0, 0);
            } catch (err) {
                console.error("Failed to fetch blog posts", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [currentPage]);

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
        return <div className="blog-loading">Loading Journal...</div>;
    }

    if (posts.length === 0) {
        return <div className="blog-empty">No blog posts found. Check back soon!</div>;
    }

    // High Fidelity Mapping Logic
    const featuredPost = posts[0];
    const topGridPosts = posts.slice(1, 7);
    const storyPost = posts[7];
    const bottomGridPosts = posts.slice(8, 11);

    return (
        <div className="blog-page fade-in">
            <div className="blog-header">
                <h1 className="blog-main-title">The Cabinet <strong>Journal</strong></h1>
                <p className="blog-main-desc">
                    Get the latest news, design tips, and project highlights from our team.
                </p>
            </div>

            {/* 1. Featured Section (Latest Post) */}
            {featuredPost && (
                <div className="blog-featured-section">
                    <div className="blog-featured-image-wrapper">
                        <img src={getImageUrl(featuredPost.thumbnail)} alt={featuredPost.title} className="blog-featured-image" />
                    </div>
                    <div className="blog-featured-content">
                        <div className="blog-meta-top">
                            <span className="blog-meta-label">{featuredPost.category?.title || featuredPost.category?.name || "Updates"}</span>
                            <div className="blog-meta-line"></div>
                            <span className="blog-meta-date">{formatDate(featuredPost.published_at || featuredPost.created_at)}</span>
                        </div>
                        <h2 className="blog-featured-title">
                            {featuredPost.title}
                        </h2>
                        <p className="blog-featured-desc">
                            {featuredPost.excerpt || (featuredPost.content ? featuredPost.content.substring(0, 150) + "..." : "")}
                        </p>
                        <Link to={`/blog/${featuredPost.id}`} className="blog-read-more-btn">see more</Link>
                    </div>
                </div>
            )}

            {/* 2. Primary Grid (Up to 6 posts) */}
            {topGridPosts.length > 0 && (
                <div className="blog-grid-section">
                    {topGridPosts.map((post) => (
                        <div className="blog-card" key={post.id}>
                            <div className="blog-card-image-wrapper">
                                <img src={getImageUrl(post.thumbnail)} alt={post.title} className="blog-card-image" />
                            </div>
                            <div className="blog-card-content">
                                <div className="blog-meta-top">
                                    <span className="blog-meta-label">{post.category?.title || post.category?.name || "Blog"}</span>
                                    <div className="blog-meta-line small"></div>
                                    <span className="blog-meta-date">{formatDate(post.published_at || post.created_at)}</span>
                                </div>
                                <h3 className="blog-card-title">{post.title}</h3>
                                <p className="blog-card-desc">{post.excerpt || (post.content ? post.content.substring(0, 100) + "..." : "")}</p>
                                <Link to={`/blog/${post.id}`} className="blog-read-more-btn dark">see more</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 3. Story Section (Decorative 8th post) */}
            {storyPost && (
                <div className="blog-story-section">
                    <div className="blog-story-image-container">
                        <div className="blog-story-accent-box"></div>
                        <img src={getImageUrl(storyPost.thumbnail)} alt={storyPost.title} className="blog-story-image" />
                    </div>
                    <div className="blog-story-content">
                        <div className="blog-meta-top">
                            <span className="blog-meta-label">{storyPost.category?.title || storyPost.category?.name || "Story"}</span>
                            <div className="blog-meta-line small"></div>
                            <span className="blog-meta-date">{formatDate(storyPost.published_at || storyPost.created_at)}</span>
                        </div>
                        <h2 className="blog-story-title">{storyPost.title}</h2>
                        <p className="blog-story-desc">
                            {storyPost.excerpt || (storyPost.content ? storyPost.content.substring(0, 120) + "..." : "")}
                        </p>
                        <Link to={`/blog/${storyPost.id}`} className="blog-read-more-btn dark">see more</Link>
                    </div>
                </div>
            )}

            {/* 4. Secondary Grid (3 more posts) */}
            {bottomGridPosts.length > 0 && (
                <div className="blog-grid-section">
                    {bottomGridPosts.map((post) => (
                        <div className="blog-card" key={post.id}>
                            <div className="blog-card-image-wrapper">
                                <img src={getImageUrl(post.thumbnail)} alt={post.title} className="blog-card-image" />
                            </div>
                            <div className="blog-card-content">
                                <div className="blog-meta-top">
                                    <span className="blog-meta-label">{post.category?.title || post.category?.name || "Blog"}</span>
                                    <div className="blog-meta-line small"></div>
                                    <span className="blog-meta-date">{formatDate(post.published_at || post.created_at)}</span>
                                </div>
                                <h3 className="blog-card-title">{post.title}</h3>
                                <p className="blog-card-desc">{post.excerpt || (post.content ? post.content.substring(0, 100) + "..." : "")}</p>
                                <Link to={`/blog/${post.id}`} className="blog-read-more-btn dark">see more</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div className="blog-pagination">
                <button
                    className="blog-page-arrow"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                >
                    <img src={leftArrow} alt="Prev" /> <span style={{ marginLeft: '10px' }}>Prev</span>
                </button>

                <div className="blog-page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                        <button
                            key={num}
                            className={`blog-page-num ${currentPage === num ? 'active' : ''}`}
                            onClick={() => setCurrentPage(num)}
                        >
                            {num}
                        </button>
                    ))}
                </div>

                <button
                    className="blog-page-arrow"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                >
                    <span style={{ marginRight: '10px' }}>Next</span> <img src={rightArrow} alt="Next" />
                </button>
            </div>
        </div >
    );
};

export default BlogPage;
