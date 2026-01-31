import React, { useRef } from 'react';
import './FrameGallery.css';

const frames = [
  { id: 1, src: '/frames/frame12.png', name: 'হ্যাঁ - Red Green' },
  { id: 2, src: '/frames/frame11.png', name: 'গণভোট হ্যাঁ' },
  { id: 3, src: '/frames/frame7.png', name: 'Premium Gold' },
  { id: 4, src: '/frames/frame8.png', name: 'Modern Flag' },
  { id: 5, src: '/frames/frame5.png', name: 'Vibrant Green' },
  { id: 6, src: '/frames/frame6.png', name: 'Classic Campaign' },
];

function FrameGallery({ selectedFrame, onSelectFrame }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 120; // Scroll by 120px
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="frame-gallery">
      <div className="gallery-header">
        <h3>ফ্রেম নির্বাচন করুন</h3>
        <div className="gallery-controls">
          <button className="scroll-btn" onClick={() => scroll('left')}>
            ‹
          </button>
          <button className="scroll-btn" onClick={() => scroll('right')}>
            ›
          </button>
        </div>
      </div>
      <div className="frame-list" ref={scrollContainerRef}>
        {frames.map((frame) => (
          <div
            key={frame.id}
            className={`frame-item ${selectedFrame === frame.src ? 'active' : ''}`}
            onClick={() => onSelectFrame(frame.src)}
            title={frame.name}
          >
            <img src={frame.src} alt={frame.name} />
            <span className="check-icon">✓</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FrameGallery;
