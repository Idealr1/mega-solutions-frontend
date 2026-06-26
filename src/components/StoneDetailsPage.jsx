import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader, ShoppingCart, Minus, Plus } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import './StoneDetailsPage.css';

const APP_LABELS = {
    interior_walls:      'Interior Walls',
    exterior_walls:      'Exterior Walls',
    interior_floors:     'Interior Floors',
    exterior_floors:     'Exterior Floors',
    kitchen_countertops: 'Kitchen Countertops',
    all_tables:          'All Tables',
};

const AppIcon = ({ kind }) => {
    const s = { stroke: '#1a1a1a', strokeWidth: 1.5, fill: 'none' };
    switch (kind) {
        case 'interior_walls':      return <svg width="44" height="40" viewBox="0 0 40 40"><path d="M4 6h32v28H4z" {...s} strokeDasharray="3 3" /><path d="M12 6v28M28 6v28" {...s} /></svg>;
        case 'exterior_walls':      return <svg width="44" height="40" viewBox="0 0 40 40"><path d="M4 6h32v28H4z" {...s} strokeDasharray="3 3" /><path d="M20 6v28" {...s} /></svg>;
        case 'interior_floors':     return <svg width="44" height="40" viewBox="0 0 40 40"><path d="M2 26h36l-8 8H10z" {...s} /></svg>;
        case 'exterior_floors':     return <svg width="44" height="40" viewBox="0 0 40 40"><path d="M2 26h36l-8 8H10z" {...s} strokeDasharray="2 2" /></svg>;
        case 'kitchen_countertops': return <svg width="44" height="40" viewBox="0 0 40 40"><path d="M3 16h34v4H3z" {...s} /><path d="M6 20v14M34 20v14" {...s} /></svg>;
        case 'all_tables':          return <svg width="44" height="40" viewBox="0 0 40 40"><path d="M3 18h34v3H3z" {...s} /><path d="M8 21l-3 12M32 21l3 12" {...s} /></svg>;
        default: return null;
    }
};

const StoneDetailsPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToCart, openCart } = useCart();
    const [stone, setStone] = useState(null);
    const [activeImg, setActiveImg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1); // square feet

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        api.get(`/stones/${slug}`)
            .then((r) => {
                if (cancelled) return;
                if (r.data?.success) {
                    setStone(r.data.data);
                    setActiveImg(r.data.data.main_image_url || (r.data.data.gallery_image_urls?.[0] ?? null));
                }
            })
            .catch((e) => console.warn('stone fetch', e))
            .finally(() => { if (!cancelled) setLoading(false); });
    }, [slug]);

    if (loading) return <div className="stone-details-loading"><Loader className="spin" size={36} /></div>;
    if (!stone)  return <div className="stone-details-loading">Stone not found.</div>;

    const gallery = stone.gallery_image_urls || [];
    const allImages = stone.main_image_url
        ? [stone.main_image_url, ...gallery.filter((u) => u !== stone.main_image_url)]
        : gallery;

    // Spec rows shown when the data is non-empty. Pulled straight from the
    // upstream bundle — slab size, thickness, finish, plus the richer
    // fields (Quality, Block, Bundle, Location, Color, Origin, etc.)
    const specRows = [
        ['Quality',          stone.quality],
        ['Thickness',        stone.thickness],
        ['Block',            stone.block],
        ['Bundle',           stone.bundle_no],
        ['Location',         null /* per-source */],
        ['Finish',           stone.surface_finish],
        ['Color',            stone.color],
        ['Origin',           stone.origin],
        ['Number of Slabs',  stone.num_slabs],
        ['Total Material Slabs Available', stone.slabs_available],
        ['Total Material Measurements',    stone.total_sqft],
        ['Average Size',     stone.average_size],
        ['Slab Size',        stone.slab_size && stone.slab_size !== stone.average_size ? stone.slab_size : null],
        ['Surface finish',   stone.surface_finish && !stone.thickness ? stone.surface_finish : null],
    ].filter(([, v]) => v != null && v !== '' && v !== '0');

    return (
        <div className="stone-details-page">
            <button className="stone-details-back" onClick={() => navigate(-1)}>
                <ChevronLeft size={18} /> Back
            </button>

            <div className="stone-details-grid">
                <div className="stone-details-image-col">
                    <div className="stone-details-main-image">
                        {activeImg
                            ? <img src={activeImg} alt={stone.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            : <div className="stone-details-image-fallback">{stone.name}</div>}
                    </div>
                    {allImages.length > 1 && (
                        <div className="stone-details-thumbs">
                            {allImages.map((url, i) => (
                                <button
                                    key={i}
                                    className={`stone-details-thumb ${activeImg === url ? 'active' : ''}`}
                                    onClick={() => setActiveImg(url)}
                                >
                                    <img src={url} alt={`${stone.name} ${i + 1}`} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="stone-details-info-col">
                    <h1 className="stone-details-title">{stone.name}</h1>
                    {stone.classification && (
                        <p className="stone-details-classification">
                            {stone.category?.toUpperCase()}{stone.classification ? ` / ${stone.classification}` : ''}
                        </p>
                    )}

                    {stone.price_per_sqft != null && (
                        <div className="stone-details-price-block">
                            <div className="stone-details-price">
                                ${Number(stone.price_per_sqft).toFixed(2)}
                                <small>/ sq.ft.</small>
                            </div>
                            <div className="stone-details-qty">
                                <label>Sq.ft.</label>
                                <div className="qty-stepper">
                                    <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={14} /></button>
                                    <input
                                        type="number"
                                        min="1"
                                        value={qty}
                                        onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                    />
                                    <button type="button" onClick={() => setQty((q) => q + 1)}><Plus size={14} /></button>
                                </div>
                                <div className="stone-details-subtotal">
                                    Subtotal: <strong>${(Number(stone.price_per_sqft) * qty).toFixed(2)}</strong>
                                </div>
                            </div>
                            <button
                                className="stone-add-cart-btn"
                                onClick={() => {
                                    addToCart({
                                        id: `stone-${stone.id}`,
                                        name: stone.name,
                                        price: stone.price_per_sqft,
                                        quantity: qty,
                                        image: stone.main_image_url,
                                        stone_id: stone.id,
                                        unit: 'sqft',
                                    });
                                    openCart();
                                }}
                            >
                                <ShoppingCart size={18} /> Add to cart
                            </button>
                        </div>
                    )}

                    <dl className="stone-spec-list">
                        {specRows.map(([label, value]) => (
                            <div key={label} className="stone-spec-row">
                                <dt>{label}</dt>
                                <dd>{value}</dd>
                            </div>
                        ))}
                    </dl>

                    <div className="stone-details-applications">
                        <h3>Applications</h3>
                        <div className="application-icons">
                            {(stone.applications || []).map((a) => (
                                <div key={a} className="application-icon">
                                    <AppIcon kind={a} />
                                    <span>{APP_LABELS[a] || a}</span>
                                </div>
                            ))}
                            {(!stone.applications || stone.applications.length === 0) && (
                                <span style={{ color: '#888' }}>—</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoneDetailsPage;
