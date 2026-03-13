import React from 'react';
import './AboutStorySection.css';
import momsImg from '../assets/images/moms.png';

const AboutStorySection = () => {
    return (
        <div className="about-story-section">
            <div className="story-container">
                <div className="story-left">
                    <img src={momsImg} alt="From Our Hands to Your Home" className="story-img" />
                </div>
                <div className="story-right">
                    <div className="story-text-wrapper">
                        <h2 className="story-title">
                            From Our Hands <br />
                            to <strong>Your Home</strong>
                        </h2>
                        <p className="story-desc">
                            What began as a small workshop and a love for fine craftsmanship has grown into a trusted name in custom cabinetry. Since day one, our mission has been simple: to create beautifully functional spaces that feel uniquely yours.
                        </p>
                        <p className="story-desc">
                            With years of hands-on experience and a deep appreciation for detail, we’ve helped countless homeowners turn kitchens, bathrooms, and living spaces into reflections of their lifestyle. Every cabinet we build is more than wood and hardware — it’s a piece of our story, and now, part of yours.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutStorySection;
