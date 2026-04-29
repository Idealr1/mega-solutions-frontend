import React from 'react';
import { Upload, ArrowLeft } from 'lucide-react';
import './visualizer-shared.css';

/**
 * Shared upload step used by Visualizer (wall material) and KarrotaVisualizer
 * (cabinet placement). Behaviour is unchanged from the original inline version
 * in Visualizer.jsx — only the location moved.
 */
const WizardUpload = ({
    setWizardStep,
    handleImageUpload,
    error,
    handleSampleMode,
    title = 'Upload Room Photo',
    subtitle = 'Take a clear photo of the wall where you want to place the cabinetry.',
    showBack = true,
    showSample = true,
}) => (
    <div className="wizard-screen">
        <div className="wizard-card">
            {showBack && (
                <button className="back-link" onClick={() => setWizardStep('selection')}>
                    <ArrowLeft size={16} /> Back
                </button>
            )}
            <h1>{title}</h1>
            <p>{subtitle}</p>

            <label className="upload-dropzone">
                <Upload size={48} />
                <span>Click to Capture or Upload Photo</span>
                <input type="file" hidden onChange={handleImageUpload} accept="image/*" />
            </label>
            {error && (
                <div className="wizard-error-container">
                    <p className="wizard-error">{error}</p>
                    {showSample && handleSampleMode && (
                        <button className="action-btn" onClick={handleSampleMode}>
                            Try with Sample Room
                        </button>
                    )}
                </div>
            )}
        </div>
    </div>
);

export default WizardUpload;
