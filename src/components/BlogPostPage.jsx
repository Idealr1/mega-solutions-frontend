import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './BlogPostPage.css';
const BlogPostPage = () => {
    const { id } = useParams();

    // In a real app, fetch post data by ID. 
    // Here we just display a static template as requested.

    return (
        <div className="blog-post-page">

            <div className="blog-post-hero">
                <img src={kitchenImage} alt="Blog Hero" className="blog-hero-image" />
                <div className="blog-hero-overlay">
                    <div className="blog-hero-content">
                        <span className="blog-post-category">Updates</span>
                        <h1 className="blog-post-title">Consectetur adipiscing elit</h1>
                        <span className="blog-post-date">08 Jun, 2025</span>
                    </div>
                </div>
            </div>

            <div className="blog-post-container">
                <div className="blog-post-body">
                    <p className="blog-lead-text">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>

                    <h2>Heading Section</h2>
                    <p>
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>

                    <p>
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                    </p>

                    <blockquote>
                        "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt."
                    </blockquote>

                    <p>
                        Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
                    </p>

                    <div className="blog-post-navigation">
                        <Link to="/blog" className="back-to-blog-btn">
                            &larr; Back to Journal
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default BlogPostPage;
