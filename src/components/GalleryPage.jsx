import React, { useState, useEffect } from 'react';
import api from '../services/api';
import getImageUrl from '../utils/imageUrl';
import './GalleryPage.css';

const GalleryPage = () => {
    const [categories, setCategories] = useState([{ id: 'all', title: 'All' }]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories?type=gallery');
                const fetched = res.data.data || res.data || [];
                setCategories([{ id: 'all', title: 'All' }, ...fetched]);
            } catch (err) {
                console.error("Failed to fetch gallery categories", err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchGalleries = async () => {
            setLoading(true);
            try {
                const endpoint = activeCategory === 'all'
                    ? '/galleries'
                    : `/galleries?category_id=${activeCategory}`;
                const res = await api.get(endpoint);
                const fetchedGalleries = res.data.data || res.data || [];

                // Flatten all images from all galleries in this category
                const allImages = [];
                fetchedGalleries.forEach(g => {
                    if (g.images) {
                        g.images.forEach(img => {
                            allImages.push({
                                id: img.id,
                                url: getImageUrl(img.image_path),
                                title: g.title
                            });
                        });
                    }
                });
                setImages(allImages);
            } catch (err) {
                console.error("Failed to fetch galleries", err);
            } finally {
                setLoading(false);
            }
        };
        fetchGalleries();
    }, [activeCategory]);

    // Grid Logic: Group images into rows following the pattern
    // Row 1: 40/60 (2)
    // Row 2: 60/40 (2)
    // Row 3: 50/50 (2)
    // Row 4: 100 (1)
    // Total 7 images per cycle.
    const renderGrid = () => {
        const rows = [];
        let itemsProcessed = 0;
        let cycle = 0;

        while (itemsProcessed < images.length) {
            const remaining = images.length - itemsProcessed;
            const cycleStep = cycle % 4;

            if (cycleStep === 0) {
                // Row 1: 40/60 (Needs 1 or 2)
                const count = Math.min(2, remaining);
                rows.push(
                    <div className="gallery-row row-1" key={`row-${cycle}`}>
                        <div className="gallery-item item-40">
                            <img src={images[itemsProcessed].url} alt={images[itemsProcessed].title} />
                        </div>
                        {count > 1 && (
                            <div className="gallery-item item-60">
                                <img src={images[itemsProcessed + 1].url} alt={images[itemsProcessed + 1].title} />
                            </div>
                        )}
                    </div>
                );
                itemsProcessed += count;
            } else if (cycleStep === 1) {
                // Row 2: 60/40 (Needs 1 or 2)
                const count = Math.min(2, remaining);
                rows.push(
                    <div className="gallery-row row-2" key={`row-${cycle}`}>
                        <div className="gallery-item item-60">
                            <img src={images[itemsProcessed].url} alt={images[itemsProcessed].title} />
                        </div>
                        {count > 1 && (
                            <div className="gallery-item item-40">
                                <img src={images[itemsProcessed + 1].url} alt={images[itemsProcessed + 1].title} />
                            </div>
                        )}
                    </div>
                );
                itemsProcessed += count;
            } else if (cycleStep === 2) {
                // Row 3: 50/50 (Needs 1 or 2)
                const count = Math.min(2, remaining);
                rows.push(
                    <div className="gallery-row row-3" key={`row-${cycle}`}>
                        <div className="gallery-item item-50">
                            <img src={images[itemsProcessed].url} alt={images[itemsProcessed].title} />
                        </div>
                        {count > 1 && (
                            <div className="gallery-item item-50">
                                <img src={images[itemsProcessed + 1].url} alt={images[itemsProcessed + 1].title} />
                            </div>
                        )}
                    </div>
                );
                itemsProcessed += count;
            } else {
                // Row 4: 100 (Needs 1)
                rows.push(
                    <div className="gallery-row row-4" key={`row-${cycle}`}>
                        <div className="gallery-item item-100">
                            <img src={images[itemsProcessed].url} alt={images[itemsProcessed].title} />
                        </div>
                    </div>
                );
                itemsProcessed += 1;
            }
            cycle++;
        }
        return rows;
    };

    return (
        <div className="gallery-page fade-in">
            <div className="gallery-filter-container">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`gallery-filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                    >
                        {cat.title || cat.name}
                    </button>
                ))}
            </div>

            <div className="gallery-grid">
                {loading ? (
                    <div className="gallery-loading">Loading Gallery...</div>
                ) : images.length > 0 ? (
                    renderGrid()
                ) : (
                    <div className="gallery-empty">No images found in this category.</div>
                )}
            </div>
        </div>
    );
};

export default GalleryPage;
