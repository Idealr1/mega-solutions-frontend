import React from 'react';
import './SubscribeSection.css';

const SubscribeSection = () => {
    return (
        <div className="subscribe-section">
            <div className="subscribe-content">
                <h2 className="subscribe-header">
                    <strong>Subscribe</strong> to <br />
                    Our Newsletter!
                </h2>
                <p className="subscribe-subtext">
                    Ad litora torquent per conubia
                </p>

                <div className="subscribe-form">
                    <input
                        type="email"
                        placeholder="Type your email"
                        className="subscribe-input"
                    />
                    <button className="subscribe-btn">
                        subscribe
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscribeSection;
