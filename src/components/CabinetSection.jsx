import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import getImageUrl from '../utils/imageUrl';
import './CabinetSection.css';

// Import local images
import inTheNavy from '../assets/images/In-The-Navy-SW-238x400.png';
import realistBeige from '../assets/images/Realist-Beige-238x400.png';
import clarySage from '../assets/images/Clary-Sage-SW-238x400.png';
import roycroftPewter from '../assets/images/Roycroft-Pewter-238x400.png';
import tricornBlack from '../assets/images/Tricorn-Black-SW-238x400.png';

const RAW_DOORS_PLACEHOLDER = [
    { id: 1, name: "IN THE NAVY", image: inTheNavy, description: "Duis aute irure dolor in reprehenderit in voluptate velit", descriptionTitle: "IN THE NAVY" },
    { id: 2, name: "REALIST BEIGE", image: realistBeige, description: "Excepteur sint occaecat cupidatat non proident", descriptionTitle: "REALIST BEIGE" },
    { id: 3, name: "CLARY SAGE", image: clarySage, description: "Sed ut perspiciatis unde omnis iste natus error", descriptionTitle: "CLARY SAGE" },
    { id: 4, name: "ROYCROFT PEWTER", image: roycroftPewter, description: "Nemo enim ipsam voluptatem quia voluptas sit", descriptionTitle: "ROYCROFT PEWTER" },
    { id: 5, name: "TRICORN BLACK", image: tricornBlack, description: "Ut enim ad minima veniam, quis nostrum exercitationem", descriptionTitle: "TRICORN BLACK" }
];

const CabinetSection = () => {
    const [categories, setCategories] = useState([{ id: 'all', title: 'All' }]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [rawDoors, setRawDoors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Create 3 sets for infinite loop
    const DOORS = rawDoors.length > 0
        ? [...rawDoors, ...rawDoors, ...rawDoors]
        : [...RAW_DOORS_PLACEHOLDER, ...RAW_DOORS_PLACEHOLDER, ...RAW_DOORS_PLACEHOLDER];
    const RAW_LEN = rawDoors.length > 0 ? rawDoors.length : RAW_DOORS_PLACEHOLDER.length;
    const MIDDLE_START_INDEX = RAW_LEN;

    // Start in the middle set
    const [currentIndex, setCurrentIndex] = useState(MIDDLE_START_INDEX);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [trackTransform, setTrackTransform] = useState(0);

    const trackRef = useRef(null);
    const wrapperRef = useRef(null);

    // Fetch Categories only on mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const catRes = await api.get('/categories');
                const fetchedCats = catRes.data.data || catRes.data || [];
                const productCats = fetchedCats.filter(c => c.type === 'product');
                setCategories([{ id: 'all', title: 'All' }, ...productCats]);
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        loadCategories();
    }, []);

    // Change products when category changes (Including 'All')
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const endpoint = activeCategory === 'all'
                    ? '/products'
                    : `/products?category_id=${activeCategory}`;

                const res = await api.get(endpoint);
                const fetched = res.data.data || res.data || [];
                const mapped = fetched.map(p => ({
                    id: p.id,
                    name: p.title,
                    image: getImageUrl(p.thumbnail),
                    description: (p.description || '').substring(0, 100) + "...",
                    descriptionTitle: p.title
                }));

                if (mapped.length > 0) {
                    setRawDoors(mapped);
                    setCurrentIndex(mapped.length); // Reset to middle of new set
                } else {
                    setRawDoors([]);
                    setCurrentIndex(RAW_DOORS_PLACEHOLDER.length);
                }
            } catch (err) {
                console.error("Failed to fetch products", err);
                setRawDoors(RAW_DOORS_PLACEHOLDER);
                setCurrentIndex(RAW_DOORS_PLACEHOLDER.length);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [activeCategory]);

    // Config for calculation
    // Image Ratio: 238 / 400 = 0.595
    const RATIO = 0.595;
    const GAP = 30;

    // We need dynamic dimensions based on screen size
    const [dimensions, setDimensions] = useState({
        activeHeight: 481,
        inactiveHeight: 360
    });

    // Calculate Transform
    // We assume all items to the left of currentIndex are effectively INACTIVE sized.
    // So LeftDistance = currentIndex * (InactiveWidth + Gap)
    // Center of Active = LeftDistance + (ActiveWidth / 2)
    // Target Translate = ScreenCenter - Center of Active

    // We update this whenever currentIndex changes or window resizes
    useEffect(() => {
        const calculateResponsiveDimensions = () => {
            const width = window.innerWidth;
            let scale = 1;

            if (width < 768) {
                scale = 0.6; // Mobile: 60% size (Increased from 50%)
            } else if (width < 1024) {
                scale = 0.75; // Tablet: 75% size
            }

            setDimensions({
                activeHeight: 481 * scale,
                inactiveHeight: 360 * scale
            });
        };

        calculateResponsiveDimensions();
        window.addEventListener('resize', calculateResponsiveDimensions);
        return () => window.removeEventListener('resize', calculateResponsiveDimensions);
    }, []);

    useEffect(() => {
        const calculatePosition = () => {
            // Recalculate widths based on current dimensions
            const inactiveWidth = dimensions.inactiveHeight * RATIO;
            const activeWidth = dimensions.activeHeight * RATIO;
            const itemFullWidth = inactiveWidth + GAP;

            const screenCenter = window.innerWidth / 2;
            const leftDistance = currentIndex * itemFullWidth;
            const activeCenter = leftDistance + (activeWidth / 2);
            const translate = screenCenter - activeCenter;

            setTrackTransform(translate);
        };

        calculatePosition();
        window.addEventListener('resize', calculatePosition);
        return () => window.removeEventListener('resize', calculatePosition);
    }, [currentIndex, dimensions]); // Add dimensions as dep

    const handleNext = () => {
        if (currentIndex >= DOORS.length - 1) return;
        setIsTransitioning(true);
        setCurrentIndex(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentIndex <= 0) return;
        setIsTransitioning(true);
        setCurrentIndex(prev => prev - 1);
    };

    // Infinite Loop Reset Logic
    useEffect(() => {
        if (!isTransitioning) return; // Only check after a move

        const timeout = setTimeout(() => {
            // Check bounds relative to the middle set
            // Raw Length = 5. Middle Set is indices 5, 6, 7, 8, 9.
            // If we are at index 10 (start of 3rd set), snap to 5.
            // If we are at index 4 (end of 1st set), snap to 9.

            const rawLen = RAW_LEN;

            if (currentIndex >= rawLen * 2) {
                // Too far right -> Snap left
                setIsTransitioning(false);
                setCurrentIndex(currentIndex - rawLen);
            } else if (currentIndex < rawLen) {
                // Too far left -> Snap right
                setIsTransitioning(false);
                setCurrentIndex(currentIndex + rawLen);
            }
        }, 500); // 500ms matches CSS transition duration

        return () => clearTimeout(timeout);
    }, [currentIndex, isTransitioning, RAW_LEN]);

    // Re-enable transition if it was disabled for snapping
    useEffect(() => {
        if (!isTransitioning) {
            // Force reflow or just next tick
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsTransitioning(true);
                });
            });
        }
    }, [isTransitioning]);

    const activeDoorData = DOORS[currentIndex] || DOORS[MIDDLE_START_INDEX];
    const navigate = useNavigate();

    const handleProductClick = (door, index) => {
        if (index === currentIndex) {
            navigate(`/product/${door.id}`);
        } else {
            setIsTransitioning(true);
            setCurrentIndex(index);
        }
    };

    return (
        <div className="cabinet-section">
            <h2 className="cabinet-header">
                Elevate Your Space<br />
                with <strong>Our Cabinets</strong>
            </h2>

            <div className="cabinet-categories">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                    >
                        {cat.title || cat.name}
                    </button>
                ))}
            </div>

            {/* Carousel Container */}
            <div className="carousel-wrapper" ref={wrapperRef}>
                <div
                    className="carousel-track"
                    ref={trackRef}
                    style={{
                        transform: `translateX(${trackTransform}px)`,
                        transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
                    }}
                >
                    {loading ? (
                        <div className="flex items-center justify-center w-full h-full">
                            <Loader className="spin" size={48} />
                        </div>
                    ) : DOORS.map((door, index) => {
                        const isActive = index === currentIndex;
                        return (
                            <div
                                key={`${door.id} -${index} `}
                                className={`carousel-item ${isActive ? 'active' : ''}`}
                                style={{
                                    height: isActive ? dimensions.activeHeight : dimensions.inactiveHeight,
                                    opacity: isActive ? 1 : 0.3,
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleProductClick(door, index)}
                            >
                                <img src={door.image} alt={door.name} />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Navigation & Description */}
            <div className="carousel-controls">
                <div className="description-container">
                    <h3
                        className="door-title"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/product/${activeDoorData.id}`)}
                    >
                        {activeDoorData.descriptionTitle}
                    </h3>
                    <p className="door-desc">{activeDoorData.description}</p>
                </div>

                <div className="nav-arrows">
                    <button className="nav-btn" onClick={handlePrev}><ChevronLeft size={40} /></button>
                    <button className="nav-btn" onClick={handleNext}><ChevronRight size={40} /></button>
                </div>
            </div>
        </div>
    );
};

export default CabinetSection;

