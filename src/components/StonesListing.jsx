import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import api from '../services/api';
import './StonesListing.css';

const CATEGORIES = [
    { id: 'all',       label: 'All' },
    { id: 'quartzite', label: 'Quartzite' },
    { id: 'granite',   label: 'Granite' },
    { id: 'marble',    label: 'Marble' },
    { id: 'quartz',    label: 'Quartz' },
];

/**
 * Stones tab on the Products page. Grid of stone tiles filterable by
 * sub-category. Each tile links to the stone detail page.
 *
 * The selected sub-category lives in the URL (?cat=marble) so the back
 * button from a stone detail page restores it.
 */
const StonesListing = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCat = searchParams.get('cat') || 'all';
    const [filter, setFilter] = useState(CATEGORIES.some((c) => c.id === initialCat) ? initialCat : 'all');
    const [stones, setStones] = useState([]);
    const [loading, setLoading] = useState(true);

    const setCategory = (cat) => {
        setFilter(cat);
        const next = new URLSearchParams(searchParams);
        next.set('tab', 'stones');
        if (cat === 'all') next.delete('cat');
        else next.set('cat', cat);
        setSearchParams(next, { replace: true });
    };

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        const url = filter === 'all' ? '/stones' : `/stones?category=${filter}`;
        api.get(url)
            .then((r) => { if (!cancelled && r.data?.success) setStones(r.data.data || []); })
            .catch((e) => console.warn('stones fetch', e))
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [filter]);


    return (
        <div className="stones-listing">
            <div className="stones-filter-bar">
                {CATEGORIES.map((c) => (
                    <button
                        key={c.id}
                        className={`stones-filter-btn ${filter === c.id ? 'active' : ''}`}
                        onClick={() => setCategory(c.id)}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="stones-loading"><Loader className="spin" size={36} /></div>
            ) : stones.length === 0 ? (
                <div className="stones-empty">No stones in this category yet.</div>
            ) : (
                <div className="stones-grid">
                    {stones.map((s) => (
                        <article key={s.id} className="stone-tile" onClick={() => navigate(`/stones/${s.slug}`)}>
                            <div className="stone-tile-image">
                                {s.main_image_url
                                    ? <img src={s.main_image_url} alt={s.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                    : <div className="stone-tile-fallback">{s.name}</div>}
                            </div>
                            <div className="stone-tile-body">
                                <h3>{s.name}</h3>
                                <p className="stone-tile-cat">{s.category}</p>
                                <ul className="stone-tile-specs">
                                    {s.slab_size && <li><span>Slab</span> {s.slab_size}</li>}
                                    {s.thickness && <li><span>Thickness</span> {s.thickness}</li>}
                                    {s.surface_finish && <li><span>Finish</span> {s.surface_finish}</li>}
                                </ul>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StonesListing;
