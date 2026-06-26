import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import api from '../services/api';
import './StoneSection.css';

/**
 * Homepage Stones section. Mirrors the cabinet section's layout — tabs
 * across the top (Quartz / Granite / Marble / Quartzite) and a carousel
 * track of stone cards underneath. Clicking a card opens the detail page.
 */
const CATEGORIES = [
    { id: 'quartzite', label: 'Quartzite' },
    { id: 'granite',   label: 'Granite' },
    { id: 'marble',    label: 'Marble' },
    { id: 'quartz',    label: 'Quartz' },
];

const StoneSection = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
    const [stones, setStones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const trackRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        api.get(`/stones?category=${activeCategory}`)
            .then((r) => { if (!cancelled && r.data?.success) { setStones(r.data.data || []); setCurrentIndex(0); } })
            .catch((e) => console.warn('stones fetch', e))
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [activeCategory]);

    const handlePrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
    const handleNext = () => setCurrentIndex((i) => Math.min(stones.length - 1, i + 1));

    const trackTransform = stones.length > 0 ? `translateX(calc(50vw - 200px - ${currentIndex * 410}px))` : 'translateX(0)';

    const activeStone = stones[currentIndex];

    return (
        <div className="stone-section">
            <h2 className="stone-header">
                Find your<br />
                <strong>perfect stone</strong>
            </h2>
            <p className="stone-sub-header">
                Explore our quarried and engineered surfaces &rarr;
            </p>

            <div className="stone-categories">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        className={`stone-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="stone-carousel-wrapper">
                <div
                    className="stone-carousel-track"
                    ref={trackRef}
                    style={{ transform: trackTransform, transition: 'transform 0.5s ease-in-out' }}
                >
                    {loading ? (
                        <div className="stone-loader"><Loader className="spin" size={48} /></div>
                    ) : stones.length === 0 ? (
                        <div className="stone-empty">No stones in this category yet.</div>
                    ) : stones.map((s, idx) => {
                        const isActive = idx === currentIndex;
                        return (
                            <div
                                key={s.id}
                                className={`stone-card ${isActive ? 'active' : ''}`}
                                onClick={() => navigate(`/stones/${s.slug}`)}
                            >
                                <div className="stone-card-image">
                                    {s.main_image_url
                                        ? <img src={s.main_image_url} alt={s.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                        : <div className="stone-card-placeholder">{s.name}</div>}
                                </div>
                                <div className="stone-card-body">
                                    <h4>{s.name}</h4>
                                    <small>{s.surface_finish || '—'}</small>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="stone-carousel-controls">
                <div className="stone-description-container">
                    {activeStone && (
                        <>
                            <h3 className="stone-title" style={{ cursor: 'pointer' }} onClick={() => navigate(`/stones/${activeStone.slug}`)}>
                                {activeStone.name}
                            </h3>
                            <p className="stone-desc">
                                {activeStone.slab_size && <>Slab {activeStone.slab_size} · </>}
                                {activeStone.thickness && <>{activeStone.thickness} · </>}
                                {activeStone.surface_finish}
                            </p>
                        </>
                    )}
                </div>
                <div className="stone-nav-arrows">
                    <button className="stone-nav-btn" onClick={handlePrev} disabled={currentIndex === 0}><ChevronLeft size={40} /></button>
                    <button className="stone-nav-btn" onClick={handleNext} disabled={currentIndex >= stones.length - 1}><ChevronRight size={40} /></button>
                </div>
            </div>
        </div>
    );
};

export default StoneSection;
