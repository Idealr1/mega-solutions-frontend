import React from 'react';
import './SubscribeSection.css';

const SubscribeSection = () => {
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
