import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CollaboratorClaims = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClaims = async () => {
            try {
                const response = await api.get('/claims');
                setClaims(response.data);
            } catch (error) {
                console.error("Failed to fetch claims", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClaims();
    }, []);

    if (loading) return <div>Loading claims...</div>;

    return (
        <div className="collaborator-claims">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>My Claims</h2>
                <button className="primary-btn">New Claim</button>
            </div>

            <table className="dashboard-table">
                <thead>
                    <tr>
                        <th>Claim ID</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {claims.length > 0 ? (
                        claims.map(claim => (
                            <tr key={claim.id}>
                                <td>#{claim.id}</td>
                                <td>{claim.subject}</td>
                                <td><span className={`status-badge ${claim.status}`}>{claim.status}</span></td>
                                <td>{new Date(claim.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button className="action-btn">View</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">No claims found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CollaboratorClaims;
