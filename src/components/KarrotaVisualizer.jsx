import React, { useState, useEffect } from 'react';
import { Loader2, Download, Sparkles, RotateCcw, X, ShoppingCart, Lock, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import WizardUpload from './visualizer-shared/WizardUpload';
import VisualizerErrorBoundary from './visualizer-shared/VisualizerErrorBoundary';
import './KarrotaVisualizer.css';

/**
 * Karrota Visualizer.
 *
 * Logged-in customers upload a room photo, click any cabinet to render their
 * kitchen with that style, then confirm to view materials and order.
 * Each render charges a small amount against the user's weekly cap; the
 * meter at the top shows what's left.
 */
const KarrotaVisualizer = () => {
    const { addToCart, openCart } = useCart();

    const [wizardStep, setWizardStep] = useState('upload');
    const [roomImage, setRoomImage] = useState(null);
    const [error, setError] = useState(null);

    const [cabinetCatalog, setCabinetCatalog] = useState([]);

    const [aiBusy, setAiBusy] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [aiResult, setAiResult] = useState(null);
    const [activeProductId, setActiveProductId] = useState(null);

    /** Weekly budget meter. Loaded on mount and after every render. */
    const [usage, setUsage] = useState(null);
    /** When true, shows the order modal with product details + variants. */
    const [showOrderModal, setShowOrderModal] = useState(false);

    // --- Catalog + usage on mount
    useEffect(() => {
        let cancelled = false;
        api.get('/visualizer/cabinets').then((r) => {
            if (!cancelled && r.data?.success) setCabinetCatalog(r.data.data || []);
        }).catch((e) => console.warn('catalog fetch failed', e));
        refreshUsage();
        return () => { cancelled = true; };
    }, []);

    const refreshUsage = async () => {
        try {
            const r = await api.get('/visualizer/usage');
            if (r.data?.success) setUsage(r.data);
        } catch (err) {
            // 401 → user not logged in. Page-level ProtectedRoute already
            // handles that, so we just silently skip.
            console.warn('usage fetch failed', err);
        }
    };

    // --- Upload
    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setRoomImage(ev.target.result);
            setWizardStep('visualizer');
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    // --- The whole point — fire generation immediately on cabinet click.
    const onCabinetClick = async (product) => {
        if (!roomImage) {
            setAiError('Please upload a room photo first.');
            return;
        }
        if (aiBusy) return;
        if (usage?.is_frozen) {
            setAiError(`Your access is paused${usage.frozen_until ? ` until ${new Date(usage.frozen_until).toLocaleString()}` : ''}.`);
            return;
        }
        if (usage && usage.remaining_eur <= 0) {
            setAiError(`Weekly limit reached. Resets ${usage.week_resets_at ? new Date(usage.week_resets_at).toLocaleString() : 'next Monday'}.`);
            return;
        }
        setActiveProductId(product.id);
        setAiBusy(true);
        setAiError(null);
        try {
            const r = await api.post('/visualizer/ai-generate', {
                image: roomImage.split(',')[1],
                product_id: product.id,
            }, { timeout: 180000 });
            if (!r.data?.success) throw new Error(r.data?.error || 'Generation failed');
            setAiResult({
                url: r.data.result_url,
                productId: r.data.product_id,
                productTitle: r.data.product_title,
                product, // keep the full product so the order modal has variants etc.
            });
            if (r.data.usage) setUsage((prev) => ({ ...(prev || {}), ...r.data.usage }));
            else refreshUsage();
        } catch (err) {
            console.error('generation error', err);
            const data = err?.response?.data;
            const msg = data?.error || err.message || 'Generation failed.';
            setAiError(msg);
            // Refresh usage so frozen/cap-reached state shows correctly
            if (data?.reason) refreshUsage();
        } finally {
            setAiBusy(false);
        }
    };

    const startOver = () => {
        setWizardStep('upload');
        setRoomImage(null);
        setAiResult(null);
        setAiError(null);
        setActiveProductId(null);
    };

    const tryAnotherCabinet = () => {
        setAiResult(null);
        setAiError(null);
        setActiveProductId(null);
    };

    // --- Order: drop a default variant of the selected product into the cart
    const orderSelectedVariant = (variant) => {
        const product = aiResult?.product;
        if (!product) return;
        addToCart({
            id: `${product.id}-${variant.id}`,
            name: `${product.title} — ${variant.variant_name}`,
            price: variant.price ?? product.price,
            quantity: 1,
            image: product.thumbnail,
            sku: variant.sku,
            product_id: product.id,
            variant_id: variant.id,
        });
        setShowOrderModal(false);
        openCart();
    };

    // --- Render: budget bar shown at the top once we have usage data
    const renderBudgetBar = () => {
        if (!usage) return null;
        const pctUsed = Math.min(100, Math.round(((usage.spent_eur || 0) / Math.max(usage.cap_eur || 1, 0.01)) * 100));
        const left = Number(usage.remaining_eur || 0).toFixed(2);
        const cap = Number(usage.cap_eur || 0).toFixed(2);
        const renders = usage.estimated_renders_left ?? 0;
        const frozen = usage.is_frozen;
        return (
            <div className={`karrota-budget ${frozen ? 'is-frozen' : (renders === 0 ? 'is-empty' : '')}`}>
                {frozen ? (
                    <>
                        <Lock size={14} />
                        <span>Access paused{usage.frozen_until ? ` until ${new Date(usage.frozen_until).toLocaleDateString()}` : ''}.</span>
                    </>
                ) : (
                    <>
                        <Sparkles size={14} />
                        <span>
                            <strong>€{left}</strong> of €{cap} left this week
                            {' · '}
                            <strong>{renders}</strong> render{renders === 1 ? '' : 's'} remaining
                        </span>
                        <div className="karrota-budget-bar"><div className="karrota-budget-bar-fill" style={{ width: pctUsed + '%' }} /></div>
                    </>
                )}
            </div>
        );
    };

    if (wizardStep === 'upload') {
        return (
            <VisualizerErrorBoundary>
                <div className="karrota-visualizer">
                    {renderBudgetBar()}
                    <WizardUpload
                        setWizardStep={setWizardStep}
                        handleImageUpload={handleImageUpload}
                        error={error}
                        showBack={false}
                        showSample={false}
                        title="Karrota Visualizer"
                        subtitle="Upload a photo of your kitchen or empty room. Then pick any cabinet style — we'll install it into your space and show you the result."
                    />
                </div>
            </VisualizerErrorBoundary>
        );
    }

    return (
        <VisualizerErrorBoundary>
            <div className="karrota-visualizer">
                {renderBudgetBar()}
                <div className="karrota-toolbar">
                    <button className="karrota-back" onClick={startOver}>
                        ← New photo
                    </button>
                    <div className="karrota-status">
                        <Sparkles size={14} />
                        {aiBusy
                            ? 'Generating your kitchen…'
                            : aiResult
                                ? <>Showing render with <strong>{aiResult.productTitle}</strong>. Click another cabinet to try a different style.</>
                                : 'Click any cabinet on the left to render a photoreal kitchen.'}
                    </div>
                    {aiResult && !aiBusy && (
                        <button className="karrota-reset" onClick={tryAnotherCabinet}>
                            <RotateCcw size={14} /> Reset
                        </button>
                    )}
                </div>

                <div className="karrota-body">
                    <aside className="karrota-sidebar">
                        <h3>Cabinets</h3>
                        {cabinetCatalog.length === 0 && (
                            <p className="karrota-empty">No cabinet products found.</p>
                        )}
                        <ul className="karrota-cabinet-list">
                            {cabinetCatalog.map((c) => {
                                const isActive = activeProductId === c.id;
                                const blocked = aiBusy || usage?.is_frozen || (usage && usage.remaining_eur <= 0);
                                return (
                                    <li
                                        key={c.id}
                                        className={`${isActive ? 'selected' : ''} ${blocked ? 'is-disabled' : ''}`}
                                        onClick={() => !blocked && onCabinetClick(c)}
                                        title={blocked ? 'Unavailable right now' : `Render kitchen with ${c.title}`}
                                    >
                                        {/* Thumbnail with detected colour swatch overlay */}
                                        <div className="karrota-cabinet-thumb-wrap">
                                            {c.thumbnail
                                                ? <img src={c.thumbnail} alt={c.title} />
                                                : <div className="karrota-thumb-placeholder" />}
                                            {c.color_hex && <span className="karrota-cabinet-swatch" style={{ background: c.color_hex }} />}
                                        </div>
                                        <div className="karrota-cabinet-meta">
                                            <strong>{c.title}</strong>
                                            <span>${Number(c.price ?? 0).toFixed(2)}</span>
                                            <small>{c.variants?.length || 0} variants</small>
                                        </div>
                                        {isActive && aiBusy && (
                                            <Loader2 className="karrota-spin karrota-cabinet-loader" size={18} />
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </aside>

                    <main className="karrota-canvas">
                        {aiError && (
                            <div className="karrota-error">
                                <AlertTriangle size={16} /> {aiError}
                            </div>
                        )}
                        <div className="karrota-canvas-inner karrota-result-stage">
                            {roomImage && (
                                <img src={roomImage} alt="Room" className="karrota-room-photo" />
                            )}
                            {aiResult && (
                                <img src={aiResult.url} alt="Rendered kitchen" className="karrota-ai-overlay" />
                            )}
                            {aiBusy && (
                                <div className="karrota-busy karrota-busy-large">
                                    <Loader2 className="karrota-spin" size={48} />
                                    <h3>Rendering your kitchen…</h3>
                                    <p>Compositing your room photo with the cabinet you chose.</p>
                                    <p className="karrota-busy-hint">This usually takes 10–30 seconds.</p>
                                </div>
                            )}
                        </div>
                        {aiResult && !aiBusy && (
                            <div className="karrota-result-actions">
                                <button className="karrota-confirm-btn" onClick={() => setShowOrderModal(true)}>
                                    <ShoppingCart size={16} /> Confirm and view materials
                                </button>
                                <a className="karrota-reset" href={aiResult.url} target="_blank" rel="noreferrer">
                                    <Download size={14} /> Open full size
                                </a>
                            </div>
                        )}
                    </main>
                </div>

                {/* --- Order modal --- */}
                {showOrderModal && aiResult?.product && (
                    <div className="karrota-order-modal" onClick={() => setShowOrderModal(false)}>
                        <div className="karrota-order-modal-inner" onClick={(e) => e.stopPropagation()}>
                            <button className="karrota-ai-close" onClick={() => setShowOrderModal(false)}>
                                <X size={18} />
                            </button>
                            <div className="karrota-order-header">
                                {aiResult.product.thumbnail && (
                                    <img src={aiResult.product.thumbnail} alt={aiResult.productTitle} className="karrota-order-thumb" />
                                )}
                                <div>
                                    <h2>{aiResult.productTitle}</h2>
                                    {aiResult.product.color_name && (
                                        <p className="karrota-order-color">
                                            <span className="karrota-cabinet-swatch" style={{ background: aiResult.product.color_hex }} />
                                            {aiResult.product.color_name}
                                        </p>
                                    )}
                                    {aiResult.product.description && (
                                        <p className="karrota-order-desc">{aiResult.product.description}</p>
                                    )}
                                </div>
                            </div>

                            <h3 className="karrota-order-section">Choose a size</h3>
                            <ul className="karrota-variant-list">
                                {(aiResult.product.variants || []).map((v) => (
                                    <li key={v.id}>
                                        <div className="karrota-variant-info">
                                            <strong>{v.variant_name}</strong>
                                            <small>{v.sku}</small>
                                        </div>
                                        <div className="karrota-variant-cta">
                                            <span className="karrota-variant-price">${Number(v.price ?? 0).toFixed(2)}</span>
                                            <button className="karrota-confirm-btn karrota-confirm-btn--small" onClick={() => orderSelectedVariant(v)}>
                                                <ShoppingCart size={14} /> Add to cart
                                            </button>
                                        </div>
                                    </li>
                                ))}
                                {(!aiResult.product.variants || aiResult.product.variants.length === 0) && (
                                    <li className="karrota-no-variants">No size variants for this product yet.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </VisualizerErrorBoundary>
    );
};

export default KarrotaVisualizer;
