import React from 'react';
import './Controls.css';

function Controls({
    zoom,
    onZoomChange,
    rotation,
    onRotationChange,
    photoShape,
    onShapeChange,
    onReset,
    onDownload,
    hasPhoto,
}) {
    return (
        <div className="controls">
            {/* Shape Toggle */}
            <div className="controls-section">
                <h4>ছবির আকার</h4>
                <div className="btn-group">
                    <button
                        className={`control-btn ${photoShape === 'circle' ? 'primary' : ''}`}
                        onClick={() => onShapeChange('circle')}
                        disabled={!hasPhoto}
                    >
                        <span className="icon">●</span> বৃত্ত
                    </button>
                    <button
                        className={`control-btn ${photoShape === 'square' ? 'primary' : ''}`}
                        onClick={() => onShapeChange('square')}
                        disabled={!hasPhoto}
                    >
                        <span className="icon">■</span> বর্গ
                    </button>
                </div>
            </div>

            {/* Position Control */}
            <div className="controls-section">
                <h4>অবস্থান</h4>
                <div className="position-grid">
                    <button className="position-btn" disabled> </button>
                    <button
                        className="control-btn position-btn"
                        onClick={() => window.movePhoto && window.movePhoto(0, -10)}
                        disabled={!hasPhoto}
                    >
                        ↑
                    </button>
                    <button className="position-btn" disabled> </button>

                    <button
                        className="control-btn position-btn"
                        onClick={() => window.movePhoto && window.movePhoto(-10, 0)}
                        disabled={!hasPhoto}
                    >
                        ←
                    </button>
                    <button className="position-btn center-btn" disabled>●</button>
                    <button
                        className="control-btn position-btn"
                        onClick={() => window.movePhoto && window.movePhoto(10, 0)}
                        disabled={!hasPhoto}
                    >
                        →
                    </button>

                    <button className="position-btn" disabled> </button>
                    <button
                        className="control-btn position-btn"
                        onClick={() => window.movePhoto && window.movePhoto(0, 10)}
                        disabled={!hasPhoto}
                    >
                        ↓
                    </button>
                    <button className="position-btn" disabled> </button>
                </div>
            </div>

            {/* Zoom Control */}
            <div className="controls-section">
                <h4>জুম</h4>
                <div className="slider-control">
                    <label>আকার</label>
                    <input
                        type="range"
                        className="zoom-slider"
                        min="0.3"
                        max="3"
                        step="0.1"
                        value={zoom}
                        onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                        disabled={!hasPhoto}
                    />
                    <span className="slider-value">{zoom.toFixed(1)}x</span>
                </div>
            </div>

            {/* Rotation Control */}
            <div className="controls-section">
                <h4>ঘোরান</h4>
                <div className="slider-control">
                    <label>কোণ</label>
                    <input
                        type="range"
                        className="rotation-slider"
                        min="-180"
                        max="180"
                        step="1"
                        value={rotation}
                        onChange={(e) => onRotationChange(parseInt(e.target.value))}
                        disabled={!hasPhoto}
                    />
                    <span className="slider-value">{rotation}°</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="controls-section">
                <div className="btn-group">
                    <button
                        className="control-btn danger"
                        onClick={onReset}
                        disabled={!hasPhoto}
                    >
                        <span className="icon">🔄</span> রিসেট
                    </button>
                    <button
                        className="control-btn primary"
                        onClick={onDownload}
                        disabled={!hasPhoto}
                    >
                        <span className="icon">💾</span> ডাউনলোড
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Controls;
