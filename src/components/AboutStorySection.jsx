import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './AboutStorySection.css';
import momsImg from '../assets/images/moms.png';

const AboutStorySection = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div className="about-story-section">
            <div className="story-container">
                <div className="story-left">
                    <img src={momsImg} alt="From Our Hands to Your Home" className="story-img" />
                </div>
                <div className="story-right">
                    <div className="story-text-wrapper">
                        <h2 className="story-title">
                            What is <strong>our story?</strong>
                        </h2>
                        <div className={`story-paragraphs ${isExpanded ? 'expanded' : 'collapsed'}`}>
                            <p className="story-desc">
                                In a small workshop, surrounded by the scent of fresh stone dust and the hum of saws, a simple idea was born: to create spaces that inspire. It wasn’t about slabs, countertops, or finishes, it was about transforming ordinary walls, floors, and surfaces into the backdrop of life’s most meaningful moments. The early days were filled with long nights, careful measurements, and countless trial-and-error attempts. Every slab touched, every cut made, was a lesson in patience, precision, and passion. Slowly, that workshop grew, not just in size, but in vision. The dream of crafting beauty that lasts, that tells a story, began to take shape.
                            </p>
                            <p className="story-desc">
                                What makes a house a home? It’s not just walls or furniture. It’s the laughter over breakfast at a newly installed island, the quiet moments of reflection in a sunlit bathroom, the pride in showing friends a space that feels truly yours. At Mega Solution, we understand this. Every surface we touch carries a purpose, a memory waiting to happen. Today, Mega Solution is more than a company. It’s a promise: that every project we take on is a collaboration, a journey from our hands to your home. Every slab is hand-selected, every installation executed with care, every detail refined to perfection.
                            </p>
                            <p className="story-desc">
                                And the story isn’t finished. With every home we transform, every kitchen, bathroom, or outdoor space we elevate, we add a new chapter, one that includes you. Because at Mega Solution, we don’t just provide surfaces; we craft experiences, shape memories, and turn dreams into tangible, breathtaking reality. Your space is waiting. Let’s write your story.
                            </p>
                        </div>
                        <button className="story-see-more-btn" onClick={() => setIsExpanded(!isExpanded)}>
                            <span>{isExpanded ? 'See less' : 'See more'}</span>
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutStorySection;
