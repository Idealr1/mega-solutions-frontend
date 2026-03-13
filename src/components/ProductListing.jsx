import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import getImageUrl from '../utils/imageUrl';
import './ProductListing.css';
import productFeatureImg from '../assets/images/productimages.png';
import rightArrow from '../assets/images/right.svg';
import leftArrow from '../assets/images/left.svg';

const CATEGORIES = ["All", "Express Series", "Premium Series", "Luxury Series"];

const ProductListing = () => {
    const [categories, setCategories] = useState([{ id: 'all', title: 'All' }]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories');
                const fetched = res.data.data || res.data || [];
                const productCats = fetched.filter(c => c.type === 'product');
                setCategories([{ id: 'all', title: 'All' }, ...productCats]);
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();
    }, []);

    // Fetch Products
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const endpoint = activeCategory === 'all'
                    ? `/products?page=${currentPage}`
                    : `/products?category_id=${activeCategory}&page=${currentPage}`;

                const res = await api.get(endpoint);
                const data = res.data.data || res.data || [];
                const meta = res.data.meta || {};

                setProducts(data);
                setTotalPages(meta.last_page || 1);
            } catch (err) {
                console.error("Failed to fetch products", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [activeCategory, currentPage]);

    // Grid layout items
    const DISPLAY_PRODUCTS = products;


    return (
        <div className="product-listing-section">
            <div className="pl-categories">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`pl-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => {
                            setActiveCategory(cat.id);
                            setCurrentPage(1);
                        }}
                    >
                        {cat.title || cat.name}
                    </button>
                ))}
            </div>

            <div className="pl-grid">
                {loading ? (
                    <div className="pl-loading">Loading products...</div>
                ) : products.length === 0 ? (
                    <div className="pl-empty">No products found in this category.</div>
                ) : (
                    <>
                        {/* Row 1 */}
                        <div className="pl-row">
                            {DISPLAY_PRODUCTS.slice(0, 4).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {/* Row 2 */}
                        {DISPLAY_PRODUCTS.length > 4 && (
                            <div className="pl-row">
                                {DISPLAY_PRODUCTS.slice(4, 8).map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}

                        {/* Row 3 - Special Feature Row */}
                        <div className="pl-row feature-row">
                            {DISPLAY_PRODUCTS[8] ? (
                                <ProductCard key={DISPLAY_PRODUCTS[8].id} product={DISPLAY_PRODUCTS[8]} />
                            ) : (
                                <div style={{ width: '400px' }}></div> // Spacer if no 9th item
                            )}

                            <div className="pl-feature-block">
                                <div className="pl-feature-bg"></div>
                                <img src={productFeatureImg} alt="Kitchen Feature" className="pl-feature-img" />
                            </div>
                        </div>

                        {/* Row 4 */}
                        {DISPLAY_PRODUCTS.length > 9 && (
                            <div className="pl-row">
                                {DISPLAY_PRODUCTS.slice(9, 13).map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Pagination */}
            <div className="pl-pagination">
                <button
                    className="pl-page-arrow"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                >
                    <img src={leftArrow} alt="Prev" /> <span style={{ marginLeft: '10px' }}>Prev</span>
                </button>

                <div className="pl-page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                        <button
                            key={num}
                            className={`pl-page-num ${currentPage === num ? 'active' : ''}`}
                            onClick={() => setCurrentPage(num)}
                        >
                            {num}
                        </button>
                    ))}
                </div>

                <button
                    className="pl-page-arrow"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                >
                    <span style={{ marginRight: '10px' }}>Next</span> <img src={rightArrow} alt="Next" />
                </button>
            </div>
        </div>
    );
};

const ProductCard = ({ product }) => {
    return (
        <div className="pl-card-wrapper">
            <div className="pl-card">
                <img src={getImageUrl(product.thumbnail)} alt={product.title} className="pl-card-img" />
            </div>
            <h3 className="pl-card-title">{product.title}</h3>
            <Link to={`/product/${product.id}`} className="pl-shop-btn">shop now</Link>
        </div>
    );
};

export default ProductListing;
