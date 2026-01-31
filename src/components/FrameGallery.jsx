import React, { useRef } from 'react';
import './FrameGallery.css';

// Frame configurations with transparent area positions
// photoX, photoY = center of transparent area (in 1080x1080 canvas)
// photoRadius = for circular frames, photoWidth/photoHeight = for rectangular frames
// shape = 'circle' or 'rectangle'
const frames = [
  {
    id: 1,
    src: '/frames/frame12.png',
    name: 'হ্যাঁ - Red Green',
    photoX: 540,
    photoY: 420,      // Adjusted slightly down
    photoRadius: 320, // Increased radius to cover checkerboard edges
    shape: 'circle'
  },
  {
    id: 2,
    src: '/frames/frame11.png',
    name: 'গণভোট হ্যাঁ',
    photoX: 540,
    photoY: 400,      // Adjusted
    photoRadius: 310, // Increased radius
    shape: 'circle'
  },
  {
    id: 3,
    src: '/frames/frame7.png',
    name: 'Premium Gold',
    photoX: 540,
    photoY: 410,
    photoWidth: 700,  // Increased width
    photoHeight: 500, // Increased height
    cornerRadius: 30, // Added radius
    shape: 'rectangle'
  },
  {
    id: 4,
    src: '/frames/frame8.png',
    name: 'Modern Flag',
    photoX: 540,
    photoY: 420,
    photoRadius: 315, // Increased radius
    shape: 'circle'
  },
  {
    id: 5,
    src: '/frames/frame5.png',
    name: 'Vibrant Green',
    photoX: 540,
    photoY: 460,      // Adjusted Y
    photoWidth: 720,  // Increased width
    photoHeight: 550, // Increased height
    cornerRadius: 50, // Added significant radius for this style
    shape: 'rectangle'
  },
  {
    id: 6,
    src: '/frames/frame6.png',
    name: 'Classic Campaign',
    photoX: 540,
    photoY: 480,
    photoWidth: 600,  // Increased square size
    photoHeight: 600,
    cornerRadius: 15, // Slight radius
    shape: 'rectangle'
  },
];

export { frames };

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
