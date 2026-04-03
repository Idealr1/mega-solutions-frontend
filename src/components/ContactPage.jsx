import React, { useState } from 'react';
import api from '../services/api';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
// Importing specific SVGs as requested
import locationIcon from '../assets/images/location.svg';
import phoneIcon from '../assets/images/phone.svg';
import mailIcon from '../assets/images/mail.svg';
import timeIcon from '../assets/images/time.svg';
import SubscribeSection from './SubscribeSection';
import './ContactPage.css';

const ContactPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/contact', { ...formData, source: 'contact' });
            setModal({
                isOpen: true,
                type: 'success',
                title: 'Message Sent!',
                message: 'Thank you for reaching out! Our team will get back to you shortly.'
            });
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Submission Failed',
                message: error.response?.data?.message || 'Something went wrong. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-page">
            <div className="contact-header-section">
                <h1 className="contact-title">We’d Love to <strong>Hear from You</strong></h1>
                <p className="contact-subtitle">
                    Have a question or need assistance? Our team is ready to help.
                    Fill out the form, send us an email, or give us a call — and we’ll get back to you as soon as possible.
                </p>
            </div>

            <div className="contact-container">
                {/* Left Side - Form (60%) */}
                <div className="contact-form-wrapper">
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name*" required className="contact-input" />
                        </div>
                        <div className="form-group">
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email*" required className="contact-input" />
                        </div>
                        <div className="form-group">
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="contact-input" />
                        </div>
                        <div className="form-group">
                            <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Your Message" required rows="4" className="contact-input contact-textarea"></textarea>
                        </div>

                        <button type="submit" className="contact-submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'send'}
                        </button>
                    </form>
                </div>

                {/* Right Side - Info (40%) */}
                <div className="contact-info-wrapper">
                    <div className="info-item">
                        <img src={locationIcon} alt="Location" className="info-icon" />
                        <div className="info-text">
                            <p className="info-label">Visit us at our office</p>
                            <p className="info-value highlight">Lorem ipsum dolor, <br /> sit amet consectetur 108</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <img src={phoneIcon} alt="Phone" className="info-icon" />
                        <div className="info-text">
                            <p className="info-label">Give us a call for any <br /> questions or inquiries</p>
                            <p className="info-value highlight">+1000000-0000</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <img src={mailIcon} alt="Mail" className="info-icon" />
                        <div className="info-text">
                            <p className="info-label">For detailed information <br /> reach out to us at:</p>
                            <p className="info-value highlight">info@megasolution.com</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <img src={timeIcon} alt="Time" className="info-icon" />
                        <div className="info-text">
                            <p className="info-label">We're available during the <br /> following hours:</p>
                            <p className="info-value highlight">Monday – Friday: 09:00 – 17:00 <br /> Saturday: 10:00 – 14:00 <br /> Sunday: Closed</p>
                        </div>
                    </div>

                    <div className="social-media-section">
                        <p className="social-label">Social media</p>
                        <div className="social-icons">
                            <Facebook size={24} className="social-icon" />
                            <Instagram size={24} className="social-icon" />
                            <Linkedin size={24} className="social-icon" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="contact-map-section">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d476429.3058027314!2d-73.97950600000001!3d40.697141499999994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e1!3m2!1sen!2s!4v1768564497589!5m2!1sen!2s"
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Office Location"
                    className="contact-map-iframe"
                ></iframe>
            </div>

            {/* Custom Modal */}
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

export default ContactPage;
