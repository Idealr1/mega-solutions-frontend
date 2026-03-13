import React from 'react';
import './PartnersSection.css';
import logo from '../assets/images/logo.png';
import knb from '../assets/images/knb-logo-2.png';
import homeIcon from '../assets/images/home_icon.png';
// import logo2 from '../assets/images/logo2.png'; // Was this found? Yes, found in search.
import logo2 from '../assets/images/logo2.png';

const PARTNERS = [
    { id: 1, img: knb, alt: 'KNB' },
    { id: 2, img: homeIcon, alt: 'Home Icon' },
    { id: 3, img: logo2, alt: 'Logo 2' },
    { id: 4, img: knb, alt: 'KNB' },
    { id: 5, img: homeIcon, alt: 'Home Icon' },
    { id: 6, img: logo2, alt: 'Logo 2' },
];

const PartnersSection = () => {
    return (
        <div className="partners-section">
            <div className="partners-carousel-wrapper">
                <div className="partners-track">
                    {/* Double the list for infinite marquee effect */}
                    {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((partner, index) => (
                        <div className="partner-logo" key={index}>
                            <img src={partner.img} alt={partner.alt} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="partners-text-container">
                <h2 className="partners-text">
                    We work with <br />
                    <strong>the best</strong>
                </h2>
                <div className="partners-line"></div>
            </div>
        </div>
    );
};

export default PartnersSection;
