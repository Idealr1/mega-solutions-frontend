import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Download, FileText, Loader } from 'lucide-react';

const CollaboratorDownloads = () => {
    const [downloads, setDownloads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDownloads = async () => {
            try {
                const response = await api.get('/downloads');
                setDownloads(response.data.data || response.data || []);
            } catch (err) {
                console.error("Failed to fetch downloads", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDownloads();
    }, []);

    if (loading) return <div>Loading downloads...</div>;

    return (
        <div className="collaborator-downloads">
            <h2>Technical Downloads</h2>
            <p>Access manuals, technical specifications, and CAD drawings.</p>

            <div className="downloads-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
                {downloads.length > 0 ? (
                    downloads.map(file => (
                        <div key={file.id} className="download-card" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <FileText size={40} color="#EC4E15" />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0 }}>{file.title}</h4>
                                    <small>{file.category || 'General'}</small>
                                </div>
                                <a href={file.file_path} download className="download-icon">
                                    <Download size={24} />
                                </a>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">No downloads available at this time.</div>
                )}
            </div>
        </div>
    );
};

export default CollaboratorDownloads;
