import React from 'react';
import './AboutPage.css';
import './AboutPage.css';
import handDoorImg from '../assets/images/handdoor.png';
import StatsSection from './StatsSection';
import AboutStorySection from './AboutStorySection';
import AboutValuesSection from './AboutValuesSection';
import PartnersSection from './PartnersSection';

const AboutPage = () => {
    return (
        <>
            <div className="about-page">
                <div className="about-left-col">
                    <div className="about-content-wrapper">
                        <h1 className="about-title">
                            Crafting Spaces with <strong>Purpose</strong>
                        </h1>
                        <p className="about-desc">
                            We design and build custom cabinetry that transforms your space and elevates your everyday living
                        </p>
                    </div>
                </div>
                <div className="about-right-col">
                    <img src={handDoorImg} alt="Crafting Spaces" className="about-hero-img" />
                </div>
            </div>
            <StatsSection />
            <AboutStorySection />
            <AboutValuesSection />
            <PartnersSection />
        </>
    );
};

export default AboutPage;
