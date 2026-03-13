import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import getImageUrl from '../utils/imageUrl';
import ProductVariants from './ProductVariants';
import kitchenBg from '../assets/images/productdetailsimage.png';
import './ProductDetailsPage.css';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/products/${id}`);
                const data = response.data.data || response.data;
                setProduct(data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch product details:", err);
                setError("Product not found or failed to load.");
            } finally {
                setLoading(false);
                window.scrollTo(0, 0);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) return <div className="pd-loading">Loading product details...</div>;
    if (error || !product) return <div className="pd-not-found">{error || "Product Not Found"}</div>;

    // Map specs dynamically
    let specs = product.spec || {};
    if (typeof specs === 'string') {
        try {
            specs = JSON.parse(specs);
        } catch (e) {
            specs = {};
        }
    }

    const specLabels = {
        wood_species: "Wood Species",
        door_style: "Door Style",
        box_construction: "Box Construction",
        drawer_glide: "Drawer Glide",
        drawer_head: "Drawer Head",
        drawer_construction: "Drawer Construction",
        hinge: "Hinge",
        cabinet_interior: "Cabinet Interior",
        cabinet_exterior: "Cabinet Exterior"
    };

    return (
        <div className="product-details-container">
            <div className="product-details-page">
                <div className="pd-left-col">
                    <div className="pd-content-wrapper">
                        <h1 className="pd-title">{product.title}</h1>

                        <div className="pd-specs-container">
                            {Object.entries(specLabels).map(([key, label]) => (
                                specs[key] ? (
                                    <div className="pd-spec-row" key={key}>
                                        <span className="pd-spec-label">{label}:</span>
                                        <span className="pd-spec-value">{specs[key]}</span>
                                    </div>
                                ) : null
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pd-right-col">
                    <img src={kitchenBg} alt="Kitchen Context" className="pd-bg-img" />
                    <div className="pd-floating-img-wrapper">
                        <img
                            src={getImageUrl(product.thumbnail)}
                            alt={product.title}
                            className="pd-floating-img"
                        />
                    </div>
                </div>
            </div>

            {/* Pass dynamic product and variants to child component */}
            <ProductVariants
                product={product}
                variants={product.variants || []}
                groupedVariants={product.grouped_variants || []}
                architectPlan={product.architect_plan_image}
            />
        </div>
    );
};

export default ProductDetailsPage;
