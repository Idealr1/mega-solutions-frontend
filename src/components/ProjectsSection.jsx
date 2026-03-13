import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './ProjectsSection.css';
import epara from '../assets/images/epara.png';
import edyta from '../assets/images/edyta.png';
import rightArrow from '../assets/images/right.svg';
import leftArrow from '../assets/images/left.svg';

// Duplicate data to create infinite loop illusion
const PROJECTS = [
    { id: 1, img: epara, name: 'Epara Project' },
    { id: 2, img: edyta, name: 'Edyta Project' },
    { id: 3, img: epara, name: 'Epara Project 2' }, // Placeholder 3rd
    { id: 4, img: edyta, name: 'Edyta Project 2' }, // Placeholder 4th
];

const ProjectsSection = () => {
    // Start at index 4 (Start of the middle set)
    const [currentIndex, setCurrentIndex] = useState(4);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const trackRef = useRef(null);

    // 3 Sets for bi-directional infinite loop
    const DISPLAY_ITEMS = [...PROJECTS, ...PROJECTS, ...PROJECTS];

    const handleNext = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex(prev => prev + 1);
    };

    const handlePrev = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex(prev => prev - 1);
    };

    // Infinite Loop Reset Logic
    useEffect(() => {
        if (!isTransitioning) return;

        const transitionEnd = () => {
            setIsTransitioning(false);

            // Middle set matches indices 4, 5, 6, 7 (Length is 4)
            // If we slide to 8 (Start of 3rd set), snap back to 4 (Start of 2nd set)
            if (currentIndex >= 8) {
                setCurrentIndex(4);
            }
            // If we slide to 3 (End of 1st set), snap back to 7 (End of 2nd set)
            else if (currentIndex <= 3) {
                setCurrentIndex(7);
            }
        };

        const track = trackRef.current;
        if (track) {
            track.addEventListener('transitionend', transitionEnd);
        }
        return () => {
            if (track) track.removeEventListener('transitionend', transitionEnd);
        };
    }, [currentIndex, isTransitioning]);

    // Safety fallback: if transitionend fails (tab inactive etc), reset after 600ms
    useEffect(() => {
        if (isTransitioning) {
            const timer = setTimeout(() => {
                setIsTransitioning(false);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [isTransitioning]);


    // Responsive Logic
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getTransformStyle = () => {
        // Gap is 30px hardcoded in CSS
        if (isMobile) {
            return `translateX(calc(-${currentIndex} * (80vw + 30px)))`;
        }
        return `translateX(calc(-${currentIndex} * (40vw + 30px)))`;
    };

    return (
        <div className="projects-section">
            <div className="projects-header-container">
                <h2 className="projects-header">
                    Our finest<br />
                    <strong>cabinetry</strong> projects
                </h2>
            </div>

            <div className="projects-content-wrapper">
                <div className="project-nav">
                    <button className="p-nav-btn" onClick={handlePrev}>
                        <img src={leftArrow} alt="Previous" className="nav-arrow-icon" />
                    </button>
                    <button className="p-nav-btn" onClick={handleNext}>
                        <img src={rightArrow} alt="Next" className="nav-arrow-icon" />
                    </button>
                </div>



                <div className="projects-carousel">
                    <div
                        className="p-track"
                        ref={trackRef}
                        style={{
                            transform: getTransformStyle(),
                            transition: isTransitioning ? 'transform 0.5s ease-out' : 'none'
                        }}
                    >
                        {/* Map 3 sets of items */}
                        {DISPLAY_ITEMS.map((item, index) => (
                            <div className="p-item" key={`${item.id}-global-${index}`}>
                                <img src={item.img} alt={item.name} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectsSection;
