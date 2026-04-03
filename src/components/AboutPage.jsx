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
                            The Home Everyone <strong>Talks About</strong>
                        </h1>
                        <p className="about-desc">
                            Yes, we are talking about your future home. For now, those tired, boring cabinets? They’re holding you back. You deserve better. Real beauty. Real strength. Cabinets that make people stop, stare, and ask, “Where’d you get those?” <br/><br/>This isn’t just about looks. It’s about how your home feels. The pride you get walking in every day. The way it makes guests jealous. Stop settling. Start upgrading.
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
