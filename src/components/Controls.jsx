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
            <div className="controls-section">
                <h4>ছবির আকার</h4>
                <div className="btn-group">
                    <button className={`control-btn ${photoShape === 'original' ? 'primary' : ''}`} onClick={() => onShapeChange('original')} disabled={!hasPhoto}>
                        ⬜ আসল
                    </button>
                    <button className={`control-btn ${photoShape === 'circle' ? 'primary' : ''}`} onClick={() => onShapeChange('circle')} disabled={!hasPhoto}>
                        ● বৃত্ত
                    </button>
                    <button className={`control-btn ${photoShape === 'square' ? 'primary' : ''}`} onClick={() => onShapeChange('square')} disabled={!hasPhoto}>
                        ■ বর্গ
                    </button>
                </div>
            </div>
            <div className="controls-section">
                <h4>জুম / আকার</h4>
                <div className="slider-control">
                    <label>ছোট-বড়</label>
                    <input type="range" min="0.1" max="2.0" step="0.01" value={zoom} onChange={(e) => onZoomChange(parseFloat(e.target.value))} disabled={!hasPhoto} />
                    <span className="slider-value">{zoom.toFixed(2)}x</span>
                </div>
            </div>
            <div className="controls-section">
                <h4>ঘোরান</h4>
                <div className="slider-control">
                    <label>কোণ</label>
                    <input type="range" min="-180" max="180" step="1" value={rotation} onChange={(e) => onRotationChange(parseInt(e.target.value))} disabled={!hasPhoto} />
                    <span className="slider-value">{rotation}°</span>
                </div>
            </div>
            <div className="controls-section minimal">
                <p className="instruction-text">ছবিটি ড্র্যাগ করে, ঘুরিয়ে বা জুম করে সঠিক স্থানে বসান।</p>
                <div className="btn-group single-row">
                    <button className="control-btn danger" onClick={onReset} disabled={!hasPhoto}>🔄 রিসেট</button>
                    <button className="control-btn primary large" onClick={onDownload} disabled={!hasPhoto}>💾 ডাউনলোড করুন</button>
                </div>
            </div>
        </div>
    );
}

export default Controls;
