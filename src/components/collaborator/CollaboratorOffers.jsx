import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Tag, Clock, Loader } from 'lucide-react';

const CollaboratorOffers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const response = await api.get('/offers');
                setOffers(response.data.data || response.data || []);
            } catch (err) {
                console.error("Failed to fetch offers", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    if (loading) return <div>Loading offers...</div>;

    return (
        <div className="collaborator-offers">
            <h2>Special Offers</h2>
            <p>Exclusive discounts and multi-buy deals available for you.</p>

            <div className="offers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px', marginTop: '30px' }}>
                {offers.length > 0 ? (
                    offers.map(offer => (
                        <div key={offer.id} className="offer-card" style={{ border: '1px solid #C7C7C7', borderRadius: '12px', overflow: 'hidden' }}>
                            <div className="offer-type" style={{ padding: '8px 15px', background: '#EC4E15', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                                {offer.type?.toUpperCase()}
                            </div>
                            <div className="offer-content" style={{ padding: '20px' }}>
                                <h3 style={{ marginTop: 0 }}>{offer.title}</h3>
                                <p>{offer.description}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '13px' }}>
                                    <Clock size={16} />
                                    <span>Expires: {new Date(offer.expires_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">No special offers active at the moment.</div>
                )}
            </div>
        </div>
    );
};

export default CollaboratorOffers;
