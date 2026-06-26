import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import api from '../services/api';
import './StoneSection.css';

/**
 * Homepage Stones section. Mirrors the CabinetSection layout:
 *   2 cards on the left (smaller, faded) | active card (centered, scaled up) | 2 cards on the right
 *
 * The track is centred by translating it so the active card sits at the
 * screen's horizontal centre. Inactive cards keep the same gap and are
 * scaled down via CSS opacity/transform.
 */
const CATEGORIES = [
    { id: 'quartzite', label: 'Quartzite' },
    { id: 'granite',   label: 'Granite' },
    { id: 'marble',    label: 'Marble' },
    { id: 'quartz',    label: 'Quartz' },
];

const BASE_ACTIVE_HEIGHT = 460;
const BASE_INACTIVE_HEIGHT = 360;
const ASPECT = 1.3; // width/height — slabs are roughly 4:3
const GAP = 30;

const StoneSection = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
    const [stones, setStones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [trackTransform, setTrackTransform] = useState(0);
    const [dimensions, setDimensions] = useState({
        activeHeight: BASE_ACTIVE_HEIGHT,
        inactiveHeight: BASE_INACTIVE_HEIGHT,
    });
    const wrapperRef = useRef(null);

    // Fetch stones when category changes
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        api.get(`/stones?category=${activeCategory}`)
            .then((r) => {
                if (cancelled) return;
                if (r.data?.success) {
                    const list = r.data.data || [];
                    setStones(list);
                    // Start in the middle of the list so the user immediately
                    // sees 2 left + active + 2 right
                    setCurrentIndex(Math.min(2, Math.max(0, Math.floor(list.length / 2))));
                }
            })
            .catch((e) => console.warn('stones fetch', e))
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [activeCategory]);

    // Responsive sizing: scale down on smaller screens
    useEffect(() => {
        const recalcDims = () => {
            const w = window.innerWidth;
            let scale = 1;
            if (w < 768) scale = 0.55;
            else if (w < 1024) scale = 0.72;
            setDimensions({
                activeHeight: BASE_ACTIVE_HEIGHT * scale,
                inactiveHeight: BASE_INACTIVE_HEIGHT * scale,
            });
        };
        recalcDims();
        window.addEventListener('resize', recalcDims);
        return () => window.removeEventListener('resize', recalcDims);
    }, []);

    // Recompute the track translate whenever the index or dimensions change.
    // Position the active card so its centre is at screen centre.
    useEffect(() => {
        const calculate = () => {
            const inactiveWidth = dimensions.inactiveHeight * ASPECT;
            const activeWidth = dimensions.activeHeight * ASPECT;
            const itemFullWidth = inactiveWidth + GAP;

            const screenCenter = window.innerWidth / 2;
            const leftDistance = currentIndex * itemFullWidth;
            const activeCenter = leftDistance + activeWidth / 2;
            setTrackTransform(screenCenter - activeCenter);
        };
        calculate();
        window.addEventListener('resize', calculate);
        return () => window.removeEventListener('resize', calculate);
    }, [currentIndex, dimensions]);

    const handlePrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
    const handleNext = () => setCurrentIndex((i) => Math.min(stones.length - 1, i + 1));

    const handleCardClick = (stone, idx) => {
        if (idx === currentIndex) {
            navigate(`/stones/${stone.slug}`);
        } else {
            setCurrentIndex(idx);
        }
    };

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

            <div className="stone-carousel-wrapper" ref={wrapperRef} style={{ height: dimensions.activeHeight + 40 }}>
                <div
                    className="stone-carousel-track"
                    style={{
                        transform: `translateX(${trackTransform}px)`,
                        transition: 'transform 0.5s ease-in-out',
                    }}
                >
                    {loading ? (
                        <div className="stone-loader"><Loader className="spin" size={48} /></div>
                    ) : stones.length === 0 ? (
                        <div className="stone-empty">No stones in this category yet.</div>
                    ) : stones.map((s, idx) => {
                        const isActive = idx === currentIndex;
                        const height = isActive ? dimensions.activeHeight : dimensions.inactiveHeight;
                        const width = height * ASPECT;
                        return (
                            <div
                                key={s.id}
                                className={`stone-card ${isActive ? 'active' : ''}`}
                                style={{
                                    height,
                                    width,
                                    opacity: isActive ? 1 : 0.4,
                                    cursor: 'pointer',
                                }}
                                onClick={() => handleCardClick(s, idx)}
                            >
                                <div className="stone-card-image">
                                    {s.main_image_url
                                        ? <img src={s.main_image_url} alt={s.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                        : <div className="stone-card-placeholder">{s.name}</div>}
                                </div>
                                {isActive && (
                                    <div className="stone-card-body">
                                        <h4>{s.name}</h4>
                                        <small>{s.surface_finish || ''}</small>
                                    </div>
                                )}
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
                    <button className="stone-nav-btn" onClick={handlePrev} disabled={currentIndex === 0}><ChevronLeft size={32} /></button>
                    <button className="stone-nav-btn" onClick={handleNext} disabled={currentIndex >= stones.length - 1}><ChevronRight size={32} /></button>
                </div>
            </div>
        </div>
    );
};

export default StoneSection;
