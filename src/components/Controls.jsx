import React from 'react';
import './Controls.css';

function Controls({
    onReset,
    onDownload,
    hasPhoto,
}) {
    return (
        <div className="controls">
            {/* Slogan Section - Gafargaon Dialect */}
            <div className="controls-section text-center">
                <h3 className="slogan-main">গফরগাঁওয়ের মাটি, রহমান পরিবারের ঘাঁটি!</h3>
                <p className="slogan-sub">গণভোট হ্যাঁ! উন্নয়নের মার্কা, হাঁস মার্কা!</p>
            </div>

            {/* Only Essential Controls */}
            <div className="controls-section minimal">
                <p className="instruction-text">ছবি অটোমেটিক সুন্দরভাবে সেট হয়ে যাবে। শুধু ডাউনলোড করুন।</p>
                <div className="btn-group single-row">
                    <button className="control-btn danger" onClick={onReset} disabled={!hasPhoto}>🔄 রিসেট</button>
                    <button className="control-btn primary large" onClick={onDownload} disabled={!hasPhoto}>💾 ডাউনলোড করুন</button>
                </div>
            </div>
        </div>
    );
}

export default Controls;
