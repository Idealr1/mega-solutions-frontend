import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './TestimonialsSection.css';
import testimonialImg from '../assets/images/testimonial.png';
import rightArrow from '../assets/images/right.svg';
import leftArrow from '../assets/images/left.svg';

const TESTIMONIALS = [
    {
        id: 1,
        img: testimonialImg,
        name: 'Cassandra Salazar',
        text: 'Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia'
    },
    {
        id: 2,
        img: testimonialImg,
        name: 'Jimmie Humphrey',
        text: 'Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere.'
    },
    {
        id: 3,
        img: testimonialImg,
        name: 'Alice Griffith',
        text: 'Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed.'
    },
    // Use 3 unique, but loop them. 
    // To make infinite logic work with 3 items shown? 
    // Screenshot shows 3 cards visible.
    // We should duplicate plenty to ensure smooth scrolling.
];

const TestimonialsSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const trackRef = useRef(null);

    // We duplicate the list to allow for infinite scrolling effect
    // If we have 3 items, duplicate 3 times = 9 items. 
    // Showing 3 at a time.
    const DISPLAY_ITEMS = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];
    // Logic: Slide by item width + gap.

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

    useEffect(() => {
        if (!isTransitioning) return;

        const transitionEnd = () => {
            setIsTransitioning(false);
            // Reset logic
            // If we reached the end of the first set (index 3), and we have 3 sets.
            // Visually index 3 is same as index 0.
            if (currentIndex >= TESTIMONIALS.length * 2) {
                // If we are deep in, jump back to middle set or start
                setCurrentIndex(TESTIMONIALS.length);
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

    useEffect(() => {
        if (currentIndex < 0) {
            setIsTransitioning(false);
            // Jump to end of 2nd set
            setCurrentIndex(TESTIMONIALS.length * 2 - 1);
        }
    }, [currentIndex]);

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Desktop: 535px + 30px gap = 565px
    // Mobile: 80vw + 30px gap (approx? let's assume gap is constant or relative)
    // Actually simplest is to calculation:
    // Mobile Item is 80vw. Gap is 30px.
    // Shift = `calc(80vw + 30px)`? We need a string for style.

    const getTransformStyle = () => {
        if (isMobile) {
            return `translateX(calc(-${currentIndex} * (80vw + 30px)))`;
        }
        return `translateX(-${currentIndex * (535 + 30)}px)`;
    };

    return (
        <div className="testimonials-section">
            <div className="testimonials-top-row">
                <h2 className="testimonials-header">
                    What our customers <br />
                    <strong>say about us?</strong>
                </h2>
                <p className="testimonials-subtext">
                    These folks thought their kitchens were fine… until Mega Solution turned them into jaw-dropping spaces.
                </p>
            </div>

            <div className="testimonials-content-wrapper">
                <div className="testimonial-nav">
                    <button className="t-nav-btn" onClick={handlePrev}>
                        <img src={leftArrow} alt="Previous" className="nav-arrow-icon" />
                    </button>
                    <button className="t-nav-btn" onClick={handleNext}>
                        <img src={rightArrow} alt="Next" className="nav-arrow-icon" />
                    </button>
                </div>


                <div className="testimonials-carousel">
                    <div
                        className="t-track"
                        ref={trackRef}
                        style={{
                            transform: getTransformStyle(),
                            transition: isTransitioning ? 'transform 0.5s ease-out' : 'none'
                        }}
                    >
                        {DISPLAY_ITEMS.map((item, index) => (
                            <div className="t-card" key={`${item.id}-${index}`}>
                                <div className="t-card-img-wrapper">
                                    <img src={item.img} alt={item.name} />
                                </div>
                                <h3 className="t-card-name">{item.name}</h3>
                                <div className="t-card-line"></div>
                                <p className="t-card-text">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestimonialsSection;
