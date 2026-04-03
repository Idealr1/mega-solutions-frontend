import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './TestimonialsSection.css';
import rightArrow from '../assets/images/right.svg';
import leftArrow from '../assets/images/left.svg';

const userIconUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";

const TESTIMONIALS = [
    {
        id: 1,
        img: userIconUrl,
        name: 'Sarah Jenkins',
        text: 'Mega Solution completely transformed our kitchen. The quality of the quartz and the attention to detail during installation were beyond our expectations. Guests literally stop and stare when they walk in!'
    },
    {
        id: 2,
        img: userIconUrl,
        name: 'Michael Thorne',
        text: 'I was skeptical about replacing our old countertops, but the team made the process so seamless. We went with a stunning granite piece, and it feels like we upgraded the entire house, not just the surfaces.'
    },
    {
        id: 3,
        img: userIconUrl,
        name: 'Emily Chen',
        text: 'The craftsmanship here is unparalleled. From selecting the perfect slab of marble to the final polished edges, every step was handled with pure professionalism. Our master bathroom looks like a luxury spa.'
    },
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
