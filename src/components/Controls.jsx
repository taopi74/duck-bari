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
    onMove,
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
                        className={`control-btn ${photoShape === 'original' ? 'primary' : ''}`}
                        onClick={() => onShapeChange('original')}
                        disabled={!hasPhoto}
                    >
                        <span className="icon">⬜</span> আসল
                    </button>
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
                        onClick={() => onMove && onMove('up')}
                        disabled={!hasPhoto}
                    >
                        ↑
                    </button>
                    <button className="position-btn" disabled> </button>

                    <button
                        className="control-btn position-btn"
                        onClick={() => onMove && onMove('left')}
                        disabled={!hasPhoto}
                    >
                        ←
                    </button>
                    <button
                        className="control-btn position-btn center-btn"
                        onClick={onReset}
                        disabled={!hasPhoto}
                        title="কেন্দ্রে আনুন"
                    >
                        ●
                    </button>
                    <button
                        className="control-btn position-btn"
                        onClick={() => onMove && onMove('right')}
                        disabled={!hasPhoto}
                    >
                        →
                    </button>

                    <button className="position-btn" disabled> </button>
                    <button
                        className="control-btn position-btn"
                        onClick={() => onMove && onMove('down')}
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
                        min="0.1"
                        max="2.0"
                        step="0.05"
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
