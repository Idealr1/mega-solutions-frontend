import React from 'react';
import './FeaturesSection.css';
import fastIcon from '../assets/images/fast.png';
import expertIcon from '../assets/images/expert.png';
import premiumIcon from '../assets/images/premium.png';
import onlineIcon from '../assets/images/online.png';

const FEATURES = [
    {
        id: 1,
        icon: fastIcon,
        title: 'Fast Shippin',
        desc: 'Pulvinar vivamus fringilla lacus nec metus bibendum egestas.'
    },
    {
        id: 2,
        icon: expertIcon,
        title: 'Expert Setup',
        desc: 'In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna'
    },
    {
        id: 3,
        icon: premiumIcon,
        title: 'Premium Materials',
        desc: 'In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna'
    },
    {
        id: 4,
        icon: onlineIcon,
        title: 'Online Support',
        desc: 'In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna'
    }
];

const FeaturesSection = () => {
    return (
        <div className="features-section">
            <div className="features-grid">
                {FEATURES.map((feature) => (
                    <div className="feature-box" key={feature.id}>
                        <div className="feature-icon-wrapper">
                            <img src={feature.icon} alt={feature.title} className="feature-icon" />
                        </div>
                        <div className="feature-content">
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-desc">{feature.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturesSection;
