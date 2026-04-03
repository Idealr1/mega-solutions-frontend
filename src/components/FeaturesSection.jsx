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
        title: 'Fast Shipping',
        desc: 'Get your cabinets delivered quickly and safely, no waiting, no hassle.'
    },
    {
        id: 2,
        icon: expertIcon,
        title: 'Expert Setup',
        desc: 'Professional installation ensures your cabinets look perfect from day one.'
    },
    {
        id: 3,
        icon: premiumIcon,
        title: 'Premium Materials',
        desc: 'Built to last with high-quality materials that combine beauty and durability.'
    },
    {
        id: 4,
        icon: onlineIcon,
        title: 'Online Support',
        desc: 'Our team is always ready to help, advice, guidance, or troubleshooting, anytime.'
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
