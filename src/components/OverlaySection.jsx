import React from 'react';
import './OverlaySection.css';
import overlayBg from '../assets/images/imageoverlay.png';

const OverlaySection = () => {
    return (
        <div className="overlay-section" style={{ backgroundImage: `url(${overlayBg})` }}>
            <div className="overlay-content">
                <h2 className="overlay-header">
                    Excepteur sint <br />
                    occaecat cupidatat
                </h2>
                <p className="overlay-desc">
                    Tempus leo eu aenean sed diam urna tempor. Pulvinar <br />
                    vivamus fringilla lacus nec metus bibendum egestas.
                </p>
                <button className="see-more-btn">see more</button>
            </div>
        </div>
    );
};

export default OverlaySection;
