import React, { useState } from 'react';
import './DesignSection.css';
import imageRoom from '../assets/images/imageroom.png';
import imageAfter from '../assets/images/imageafter.png';

const DesignSection = () => {
    // 50% default to show half/half
    const [sliderValue, setSliderValue] = useState(50);

    const handleSliderChange = (e) => {
        setSliderValue(e.target.value);
    };

    return (
        <div className="design-section">
            <div className="design-content">
                {/* Left Side: Text & Controls */}
                <div className="design-left">
                    <h2 className="design-header">
                        <strong>Design it</strong> where<br />
                        it matters most
                    </h2>
                    <p className="design-desc">
                        See exactly how our cabinets will look in your home
                        —just snap, upload, and explore the possibilities.
                    </p>

                    <p className="slide-text">Slide to Try</p>

                    <div className="slider-wrapper">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={sliderValue}
                            onChange={handleSliderChange}
                            className="design-slider"
                        />
                    </div>

                    <button className="generate-btn">
                        generate
                    </button>
                </div>

                {/* Right Side: Image Comparison */}
                <div className="design-right">
                    <div className="comparison-container">
                        {/* Base Image (Before/Room) */}
                        <img
                            src={imageRoom}
                            alt="Original Room"
                            className="comp-img room-img"
                        />

                        {/* Overlay Image (After) - Clipped */}
                        <div
                            className="comp-overlay"
                            style={{ width: `${sliderValue}%` }}
                        >
                            <img
                                src={imageAfter}
                                alt="Designed Room"
                                className="comp-img after-img"
                            />
                        </div>

                        {/* Slider Handle Line (Visual only, dragged via input) */}
                        <div
                            className="slider-line"
                            style={{ left: `${sliderValue}%` }}
                        >
                            <div className="slider-button"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignSection;
