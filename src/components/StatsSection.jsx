
import React, { useState, useEffect, useRef } from 'react';
import './StatsSection.css';
import projectsIcon from '../assets/images/projects.png';
import happyClientsIcon from '../assets/images/happyclients.png';
// Note: filename has a typo 'teamemebers.png' based on directory listing
import teamMembersIcon from '../assets/images/teamemebers.png';

const Counter = ({ end, duration, trigger }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!trigger) {
            setCount(0); // Reset when out of view if desired, or just wait. User said "everytime", implies re-animation.
            return;
        }

        let start = 0;
        const totalSteps = 60; // Increase frames for smoothness
        const stepDuration = duration / totalSteps;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep += 1;
            const progress = currentStep / totalSteps;
            // Ease-out function for smoother effect: 1 - pow(1 - x, 3)
            const easeOut = 1 - Math.pow(1 - progress, 3);

            const currentCount = Math.min(Math.floor(easeOut * end), end);
            setCount(currentCount);

            if (currentStep >= totalSteps) {
                clearInterval(timer);
            }
        }, stepDuration);

        return () => clearInterval(timer);
    }, [end, duration, trigger]);

    return <span>{count}</span>;
}

const StatsSection = () => {
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Set visible when intersecting
                if (entry.isIntersecting) {
                    setIsVisible(true);
                } else {
                    // Reset when scrolling away to allow re-animation "next time"
                    setIsVisible(false);
                }
            },
            { threshold: 0.3 } // Trigger when 30% visible
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    return (
        <div className="stats-section" ref={sectionRef}>
            <div className="stats-left">
                <h2 className="stats-header">
                    Trusted by over <br />
                    <strong>650 clients</strong>
                </h2>
                <div className="stats-separator"></div>
            </div>

            <div className="stats-right">
                <div className="stat-item">
                    <div className="stat-icon-wrapper">
                        <img src={projectsIcon} alt="Projects" className="stat-icon" />
                    </div>
                    <div className="stat-number">
                        <Counter end={80} duration={2000} trigger={isVisible} />
                    </div>
                    <div className="stat-label">projects</div>
                </div>

                <div className="stat-item">
                    <div className="stat-icon-wrapper">
                        <img src={happyClientsIcon} alt="Happy Clients" className="stat-icon" />
                    </div>
                    <div className="stat-number">
                        <Counter end={365} duration={2000} trigger={isVisible} />
                    </div>
                    <div className="stat-label">happy clients</div>
                </div>

                <div className="stat-item">
                    <div className="stat-icon-wrapper">
                        <img src={teamMembersIcon} alt="Team Members" className="stat-icon" />
                    </div>
                    <div className="stat-number">
                        <Counter end={30} duration={2000} trigger={isVisible} />
                    </div>
                    <div className="stat-label">team members</div>
                </div>
            </div>
        </div>
    );
};

export default StatsSection;
