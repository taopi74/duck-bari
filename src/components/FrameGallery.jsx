import React, { useRef } from 'react';
import './FrameGallery.css';

// Frame configurations with transparent area positions
// photoX, photoY = center of transparent area (in 1080x1080 canvas)
// photoRadius = for circular frames, photoWidth/photoHeight = for rectangular frames
// shape = 'circle' or 'rectangle'
const frames = [
  {
    id: 3,
    src: '/frames/frame7.png',
    name: 'গোল্ডেন ফ্রেম',
    photoX: 540,
    photoY: 410,
    photoWidth: 620,
    photoHeight: 420,
    cornerRadius: 30,
    shape: 'rectangle'
  },
  {
    id: 5,
    src: '/frames/frame5.png',
    name: 'ভাইব্রেন্ট গ্রিন',
    photoX: 512,
    photoY: 504,
    photoWidth: 680,
    photoHeight: 490,
    cornerRadius: 40,
    shape: 'rectangle'
  },
  {
    id: 6,
    src: '/frames/frame6.png',
    name: 'ক্লাসিক ক্যাম্পেইন',
    photoX: 512,
    photoY: 590,
    photoWidth: 435,
    photoHeight: 420,
    cornerRadius: 15,
    shape: 'rectangle'
  },
];

export { frames };

function FrameGallery({ selectedFrame, onSelectFrame }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 120;
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
            ❮
          </button>
          <button className="scroll-btn" onClick={() => scroll('right')}>
            ❯
          </button>
        </div>
      </div>

      <div className="frames-scroll-container" ref={scrollContainerRef}>
        <div className="frame-list">
          {frames.map((frame) => (
            <div
              key={frame.id}
              className={`frame-item ${selectedFrame === frame.src ? 'selected' : ''}`}
              onClick={() => onSelectFrame(frame.src)}
            >
              <img src={frame.src} alt={frame.name} />
              {selectedFrame === frame.src && <div className="check-icon">✓</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FrameGallery;

