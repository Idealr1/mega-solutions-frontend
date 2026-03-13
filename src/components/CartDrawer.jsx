import React, { useEffect } from 'react';
import { X, Plus, Minus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import getImageUrl from '../utils/imageUrl';
import './CartDrawer.css';

const CartDrawer = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        cart, isCartOpen, closeCart, updateQuantity, removeFromCart, clearCart, cartTotal,
        wishlist, isWishlistOpen, closeWishlist, removeFromWishlist, addToCart
    } = useCart();

    const isOpen = isCartOpen || isWishlistOpen;
    const type = isCartOpen ? 'cart' : 'wishlist';
    const items = isCartOpen ? cart : wishlist;
    const title = isCartOpen ? 'Cart' : 'Wishlist';

    // Disable body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        if (isCartOpen) closeCart();
        if (isWishlistOpen) closeWishlist();
    };

    return (
        <div className="cart-overlay">
            <div className="cart-backdrop" onClick={handleClose}></div>
            <div className={`cart-panel ${isOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h2 className="cart-title">{title}</h2>
                    <button className="cart-close-btn" onClick={handleClose}>
                        <X size={32} color="#000" />
                    </button>
                </div>

                <div className="cart-items-container">
                    {items.length === 0 ? (
                        <p className="cart-empty-msg">Your {type} is empty.</p>
                    ) : (
                        items.map((item, index) => (
                            <div className="cart-item" key={`${item.name}-${index}`}>
                                {/* Logic to find image: Check if item has image property or use placeholders from context logic 
                                    Since we passed simplistic data from table, we might not have the image URL in the table row data.
                                    However, the table row data in ProductVariants only has name, desc, price.
                                    We need to pass the image from the VariantSection to the VariantRow to the Cart.
                                    Refactor ProductVariants to include image in item data is best. 
                                    For now, we'll use a placeholder or check if item has 'image'.
                                */}
                                <div className="cart-item-img-wrapper">
                                    {/* If item.image exists use it, otherwise use a placeholder or icon */}
                                    {item.image ? (
                                        <img src={getImageUrl(item.image)} alt={item.name} className="cart-item-img" />
                                    ) : (
                                        <div className="cart-item-placeholder">No Img</div>
                                    )}
                                </div>

                                <div className="cart-item-details">
                                    <h4 className="cart-item-name">{item.name}</h4>
                                    <p className="cart-item-desc">{item.desc}</p>
                                    <p className="cart-item-price">${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</p>

                                    {type === 'cart' && (
                                        <div className="cart-item-controls">
                                            <div className="qty-control">
                                                <button onClick={() => updateQuantity(item.name, -1)} disabled={item.quantity <= 1}><Minus size={14} /></button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.name, 1)}><Plus size={14} /></button>
                                            </div>
                                            <button className="cart-remove-btn" onClick={() => removeFromCart(item.name)}>Remove</button>
                                        </div>
                                    )}

                                    {type === 'wishlist' && (
                                        <div className="cart-item-controls">
                                            <button className="cart-move-btn" onClick={() => { addToCart(item); removeFromWishlist(item.name); }}>Add to Cart</button>
                                            <button className="cart-remove-btn" onClick={() => removeFromWishlist(item.name)}>Remove</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {type === 'cart' && items.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-subtotal">
                            <span>Subtotal</span>
                            <span className="cart-total-price">${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="cart-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button
                                className="cart-checkout-btn"
                                onClick={() => {
                                    closeCart();
                                    navigate('/checkout');
                                }}
                            >
                                CHECK OUT
                            </button>

                            {/* Collaborator specific: Request Quote */}
                            {user?.role === 'collaborator' && (
                                <button
                                    className="btn-secondary"
                                    style={{ width: '100%', padding: '15px' }}
                                    onClick={async () => {
                                        try {
                                            const response = await api.post('/quotes', {
                                                items: cart.map(item => ({
                                                    product_id: item.id || item.product_id, // Ensure we have ID
                                                    quantity: item.quantity
                                                }))
                                            });
                                            alert("Quote submitted successfully!");
                                            clearCart();
                                            closeCart();
                                            navigate('/collaborator/quotes');
                                        } catch (err) {
                                            console.error("Quote submission failed", err);
                                            alert("Failed to submit quote. Please try again.");
                                        }
                                    }}
                                >
                                    REQUEST QUOTE
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
