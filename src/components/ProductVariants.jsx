import React from 'react';
import './ProductVariants.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import getImageUrl from '../utils/imageUrl';
import heartIconPng from '../assets/images/heart.png';

// Fallback images if API doesn't provide them
import fullHeightImg from '../assets/images/fullheight.png';

const ProductVariants = ({ product, variants, groupedVariants, architectPlan }) => {
    const { user } = useAuth();
    const isCollaborator = user?.role === 'collaborator';

    // 1. If we have EXPLICIT grouped_variants from API, use them
    if (groupedVariants && groupedVariants.length > 0) {
        return (
            <div className="product-variants-section">
                {groupedVariants.map((group, idx) => (
                    <VariantSection
                        key={idx}
                        title={group.group_name}
                        image={getImageUrl(group.architect_image) || getImageUrl(architectPlan) || fullHeightImg}
                        imageLabel={group.group_name?.substring(0, 3).toUpperCase()}
                        data={group.variants}
                        product={product}
                        isCollaborator={isCollaborator}
                    />
                ))}
            </div>
        );
    }

    // 2. FALLBACK: Group variants by keywords in their name (for older products)
    const groups = {
        fullHeight: variants.filter(v => v.variant_name?.toLowerCase().includes('height') || v.sku?.includes('V')),
        singleDoor: variants.filter(v => (v.variant_name?.toLowerCase().includes('single') || v.sku?.includes('B')) && !(v.variant_name?.toLowerCase().includes('double') || v.sku?.includes('D'))),
        doubleDoor: variants.filter(v => v.variant_name?.toLowerCase().includes('double') || v.sku?.includes('D'))
    };

    const hasGroups = groups.fullHeight.length > 0 || groups.singleDoor.length > 0 || groups.doubleDoor.length > 0;

    return (
        <div className="product-variants-section">
            {!hasGroups && variants.length > 0 && (
                <VariantSection
                    title="PRODUCT VARIANTS"
                    image={getImageUrl(architectPlan) || fullHeightImg}
                    imageLabel={product?.title?.substring(0, 3)}
                    data={variants}
                    product={product}
                    isCollaborator={isCollaborator}
                />
            )}

            {groups.fullHeight.length > 0 && (
                <VariantSection
                    title="FULL HEIGHT BASE"
                    image={getImageUrl(architectPlan) || fullHeightImg}
                    imageLabel="V09"
                    data={groups.fullHeight}
                    product={product}
                    isCollaborator={isCollaborator}
                />
            )}

            {groups.singleDoor.length > 0 && (
                <VariantSection
                    title="SINGLE DOOR BASES"
                    image={getImageUrl(architectPlan) || fullHeightImg}
                    imageLabel="B06"
                    data={groups.singleDoor}
                    product={product}
                    isCollaborator={isCollaborator}
                />
            )}

            {groups.doubleDoor.length > 0 && (
                <VariantSection
                    title="DOUBLE DOOR BASES"
                    image={getImageUrl(architectPlan) || fullHeightImg}
                    imageLabel="B48"
                    data={groups.doubleDoor}
                    product={product}
                    isCollaborator={isCollaborator}
                />
            )}
        </div>
    );
};

const VariantSection = ({ title, image, imageLabel, data, product, isCollaborator }) => {
    return (
        <div className="pv-variant-group">
            <h2 className="pv-group-title">{title}</h2>
            <div className="pv-content-row">
                {/* Left: Image Card */}
                <div className="pv-image-card-wrapper">
                    <div className="pv-image-card">
                        <img src={image} alt={title} className="pv-card-img" />
                        <span className="pv-img-label">{imageLabel}</span>
                    </div>
                </div>

                {/* Right: Table */}
                <div className="pv-table-wrapper">
                    <table className="pv-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th>Buy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((v, index) => (
                                <VariantRow
                                    key={v.id || index}
                                    item={{
                                        id: product?.id || v.product_id, // Ensure parent product ID
                                        variant_id: v.id,
                                        sku: v.sku,
                                        name: v.sku,
                                        desc: v.variant_name || v.full_dimensions || `${v.width}"W*${v.height}"H*${v.depth}"D`,
                                        price: isCollaborator ? parseFloat(v.collaborator_price || v.regular_price || 0) : parseFloat(v.regular_price || 0),
                                        regular_price: parseFloat(v.regular_price || 0),
                                        image: getImageUrl(product?.thumbnail)
                                    }}
                                    isCollaborator={isCollaborator}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const VariantRow = ({ item, isCollaborator }) => {
    const { addToCart, addToWishlist } = useCart();

    const handleAddToCart = () => {
        addToCart({
            ...item,
            quantity: 1
        });
    };

    return (
        <tr>
            <td className="pv-cell-name">{item.name}</td>
            <td className="pv-cell-desc">{item.desc}</td>
            <td className="pv-cell-price">
                {isCollaborator && item.regular_price > item.price ? (
                    <div className="pv-price-container">
                        <span className="pv-regular-price-slashed">${parseFloat(item.regular_price).toFixed(2)}</span>
                        <span className="pv-collaborator-price">${parseFloat(item.price).toFixed(2)}</span>
                    </div>
                ) : (
                    `$${parseFloat(item.price).toFixed(2)}`
                )}
            </td>
            <td className="pv-cell-buy">
                <div className="pv-buy-actions">
                    <button className="pv-shop-now-btn" onClick={handleAddToCart}>
                        shop now
                    </button>
                    <button className="pv-wishlist-btn" onClick={() => addToWishlist(item)}>
                        <img src={heartIconPng} alt="Wishlist" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default ProductVariants;
