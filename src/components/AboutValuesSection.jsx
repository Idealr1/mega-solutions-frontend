import React from 'react';
import './AboutValuesSection.css';
// Note: User specified handwood.png, but it was not found in the directory scan. 
// Using handdoor.png as a fallback/placeholder or assuming it will be added.
// I will point to handwood.png so it works when the file exists.
import handWoodImg from '../assets/images/handdoor.png';
// If handwood.png keeps failing build, replace line above with:
// import handWoodImg from '../assets/images/handdoor.png';

const AboutValuesSection = () => {
    return (
        <div className="about-values-section">
            <div className="values-hero-img-wrapper">
                <img src={handWoodImg} alt="Hand opening drawer" className="values-hero-img"
                    onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                {/* Added fallback to hide if broken */}
            </div>

            <div className="values-content-container">
                {/* Row 1 */}
                <div className="values-row">
                    <div className="values-left">
                        <h2 className="values-header">
                            Elevating Everyday Living <br />
                            Through <strong>Smart Design</strong>
                        </h2>
                        <div className="values-underline orange-line"></div>
                    </div>
                    <div className="values-right">
                        <p className="values-desc">
                            We design and build custom cabinetry that brings elegance and efficiency to modern living. Our mission is to merge clean aesthetics with practical function — so every space works better and looks better.
                        </p>
                    </div>
                </div>

                {/* Row 2 */}
                <div className="values-row">
                    <div className="values-left">
                        <h2 className="values-header">
                            To Redefine the Way People <br />
                            <strong>Experience Their Spaces</strong>
                        </h2>
                        <div className="values-underline white-line"></div>
                    </div>
                    <div className="values-right">
                        <p className="values-desc">
                            We aim to inspire a new standard in cabinetry — one where thoughtful design and seamless execution come together to transform how people live, work, and feel in their homes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutValuesSection;
