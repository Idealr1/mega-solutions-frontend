import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import getImageUrl from '../utils/imageUrl';
import './CheckoutPage.css';
import { ArrowLeft, CreditCard, Truck, Package, CheckCircle, Loader } from 'lucide-react';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cart, cartTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'USA',
        shipping_method: 'standard',
        payment_method: 'credit_card'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;

        setLoading(true);
        setError(null);

        try {
            const orderData = {
                ...formData,
                items: cart.map(item => ({
                    product_id: item.id, // The parent product ID
                    variant_id: item.variant_id, // The specific variant ID
                    quantity: item.quantity,
                    price: item.price
                })),
                total_price: cartTotal
            };

            await api.post('/orders', orderData);
            setSuccess(true);
            clearCart();
        } catch (err) {
            console.error("Order submission failed:", err);
            setError(err.response?.data?.message || "Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="checkout-success-container">
                <div className="success-content fade-in">
                    <CheckCircle size={80} color="#1e8e3e" />
                    <h1>Order Placed Successfully!</h1>
                    <p>Thank you for your purchase. We've sent a confirmation email to {formData.email}.</p>
                    <button className="btn-primary" onClick={() => navigate('/products')}>Continue Shopping</button>
                    {user?.role === 'collaborator' && (
                        <button className="btn-secondary" onClick={() => navigate('/collaborator/dashboard')}>Go to Dashboard</button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page fade-in">
            <div className="checkout-header">
                <button className="back-link" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} /> Back to shopping
                </button>
                <h1>Checkout</h1>
            </div>

            <div className="checkout-container">
                <form className="checkout-form" onSubmit={handleSubmit}>
                    <section className="checkout-section">
                        <div className="section-header">
                            <Truck size={24} />
                            <h2>Shipping Details</h2>
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>First Name*</label>
                                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Last Name*</label>
                                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
                            </div>
                            <div className="form-group full-width">
                                <label>Email Address*</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="form-group full-width">
                                <label>Phone Number*</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                            </div>
                            <div className="form-group full-width">
                                <label>Address*</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Street Address" required />
                            </div>
                            <div className="form-group">
                                <label>City*</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>State/Province*</label>
                                <input type="text" name="state" value={formData.state} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Zip/Postal Code*</label>
                                <input type="text" name="zip_code" value={formData.zip_code} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Country</label>
                                <select name="country" value={formData.country} onChange={handleChange}>
                                    <option value="USA">United States</option>
                                    <option value="CAN">Canada</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="checkout-section">
                        <div className="section-header">
                            <CreditCard size={24} />
                            <h2>Payment Method</h2>
                        </div>
                        <div className="payment-options">
                            <label className={`payment-option ${formData.payment_method === 'credit_card' ? 'active' : ''}`}>
                                <input type="radio" name="payment_method" value="credit_card" checked={formData.payment_method === 'credit_card'} onChange={handleChange} />
                                <span>Credit Card</span>
                            </label>
                            <label className={`payment-option ${formData.payment_method === 'bank_transfer' ? 'active' : ''}`}>
                                <input type="radio" name="payment_method" value="bank_transfer" checked={formData.payment_method === 'bank_transfer'} onChange={handleChange} />
                                <span>Bank Transfer</span>
                            </label>
                            <label className={`payment-option ${formData.payment_method === 'cod' ? 'active' : ''}`}>
                                <input type="radio" name="payment_method" value="cod" checked={formData.payment_method === 'cod'} onChange={handleChange} />
                                <span>Cash on Delivery</span>
                            </label>
                        </div>

                        {formData.payment_method === 'credit_card' && (
                            <div className="mock-payment-msg">
                                <p>Secure payment processing will be handled by Stripe. (Integration Pending)</p>
                            </div>
                        )}

                        {formData.payment_method === 'bank_transfer' && (
                            <div className="mock-payment-msg bank-details">
                                <h3>Test Bank Details</h3>
                                <p><strong>Bank Name:</strong> Mega Solutions Test Bank</p>
                                <p><strong>Account Name:</strong> Mega Solutions LLC</p>
                                <p><strong>Account Number:</strong> 1234 5678 9012</p>
                                <p><strong>Routing Number:</strong> 987654321</p>
                                <p className="payment-note">Please include your Order ID in the transfer reference.</p>
                            </div>
                        )}

                        {formData.payment_method === 'cod' && (
                            <div className="mock-payment-msg">
                                <p>Pay with cash upon delivery of your products.</p>
                            </div>
                        )}
                    </section>

                    {error && <div className="checkout-error">{error}</div>}

                    <button type="submit" className="submit-order-btn" disabled={loading || cart.length === 0}>
                        {loading ? <><Loader size={20} className="spin" /> Processing...</> : `Place Order • $${cartTotal.toFixed(2)}`}
                    </button>
                </form>

                <aside className="order-summary">
                    <div className="summary-card">
                        <div className="section-header">
                            <Package size={24} />
                            <h2>Order Summary</h2>
                        </div>
                        <div className="summary-items">
                            {cart.map((item, idx) => (
                                <div className="summary-item" key={idx}>
                                    <div className="summary-item-img">
                                        <img src={getImageUrl(item.image)} alt={item.name} />
                                    </div>
                                    <div className="summary-item-info">
                                        <h4>{item.name}</h4>
                                        <p>Qty: {item.quantity}</p>
                                        <span className="price">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="summary-totals">
                            <div className="total-row">
                                <span>Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="total-row">
                                <span>Shipping</span>
                                <span>FREE</span>
                            </div>
                            <div className="total-row grand-total">
                                <span>Total</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CheckoutPage;
