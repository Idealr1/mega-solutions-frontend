import React, { useState } from 'react';
import api from '../services/api';
import './SubscribeSection.css';

const SubscribeSection = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!email) return;
        setIsSubmitting(true);
        try {
            await api.post('/subscriber', { email });
            setModal({
                isOpen: true,
                type: 'success',
                title: 'Subscribed Successfully!',
                message: 'Thank you for subscribing to our newsletter. We will send you updates.'
            });
            setEmail('');
        } catch (error) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Subscription Failed',
                message: error.response?.data?.message || 'Something went wrong. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="subscribe-section">
            <div className="subscribe-content">
                <h2 className="subscribe-header">
                    <strong>Subscribe</strong> to <br />
                    our newsletter!
                </h2>
                <p className="subscribe-subtext">
                    Get the latest tips, trends, and Mega deals straight to your inbox! <br /> Cabinetry that transforms rooms and turns everyday into extraordinary.
                </p>

                <form className="subscribe-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Type your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="subscribe-input"
                        required
                    />
                    <button type="submit" className="subscribe-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'subscribing...' : 'subscribe'}
                    </button>
                </form>
            </div>

            {/* Custom Modal Overlay */}
            {modal.isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
                    <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                        <div style={{ fontSize: '48px', color: modal.type === 'success' ? '#2ecc71' : '#f44336', marginBottom: '16px' }}>
                            {modal.type === 'success' ? '✓' : '✖'}
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '10px', color: '#333' }}>{modal.title}</h2>
                        <p style={{ color: '#666', lineHeight: '1.5', marginBottom: '24px' }}>{modal.message}</p>
                        <button onClick={() => setModal({ ...modal, isOpen: false })} style={{ background: '#EC4E15', color: '#fff', border: 'none', padding: '10px 30px', fontSize: '16px', cursor: 'pointer', outline: 'none' }}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscribeSection;
