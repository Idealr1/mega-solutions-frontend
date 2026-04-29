import React from 'react';
import './visualizer-shared.css';

/**
 * Shared error boundary for visualizer surfaces. Logs the error and renders
 * a reload button so a single bad render does not blank the whole page.
 */
class VisualizerErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Visualizer Error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="visualizer-error">
                    <h3>Something went wrong with the visualizer.</h3>
                    <button onClick={() => window.location.reload()}>Reload Visualizer</button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default VisualizerErrorBoundary;
