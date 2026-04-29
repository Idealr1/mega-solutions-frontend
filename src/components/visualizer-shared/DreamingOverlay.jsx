import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Shared "analysing your room" loader. Used by both wall-material and
 * cabinet visualizers while the AI architect endpoint is running.
 */
const DreamingOverlay = ({
    title = 'Mega Solutions is analyzing your space...',
    subtitle = 'Detecting walls, perspective, and lighting for a 100% realistic miracle.',
}) => (
    <div className="wizard-screen">
        <div className="dreaming-content">
            <div className="dreaming-loader">
                <Sparkles className="sparkle-1" />
                <Sparkles className="sparkle-2" />
                <Sparkles className="sparkle-3" />
            </div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
        </div>
    </div>
);

export default DreamingOverlay;
