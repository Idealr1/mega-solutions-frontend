import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './HeroSection.css';
import doorImage from '../assets/images/door.png';
import rightSideImage from '../assets/images/rightside.png';

const HeroSection = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div className="hero-container">
            <div className="hero-left">
                <div className="hero-content">
                    <h1 className="hero-header">
                        Go <strong>Mega</strong> with Your Space.
                    </h1>
                    <div className="hero-desc-container">
                        <div className={`hero-desc-wrapper ${isExpanded ? 'expanded' : 'collapsed'}`}>
                            <p className="hero-description">
                                Discover expertly curated natural and engineered stone surfaces designed to bring beauty, durability, and sophistication into every space. From kitchens to bathrooms and beyond, our premium selection and precision craftsmanship ensure every project is built to impress and made to last.
                            </p>
                        </div>
                        <button className="hero-see-more-btn" onClick={() => setIsExpanded(!isExpanded)}>
                            <span>{isExpanded ? 'See less' : 'See more'}</span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    </div>
                    <Link to="/more" className="hero-btn">
                        Start Here
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
