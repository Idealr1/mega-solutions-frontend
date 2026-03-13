import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';
import doorImage from '../assets/images/door.png';
import rightSideImage from '../assets/images/rightside.png';

const HeroSection = () => {
    return (
        <div className="hero-container">
            <div className="hero-left">
                <div className="hero-content">
                    <h1 className="hero-header">
                        Lorem ipsum dolor sit amet
                    </h1>
                    <p className="hero-description">
                        consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
                    </p>
                    <Link to="/more" className="hero-btn">
                        see more
                    </Link>
                </div>
            </div>

            <div className="hero-right" style={{ backgroundImage: `url(${rightSideImage})` }}>
                {/* Right side background image handled via inline style or CSS if static */}
            </div>

            <div className="hero-door-container">
                <img src={doorImage} alt="Door" className="hero-door-img" />
            </div>
        </div>
    );
};

export default HeroSection;
