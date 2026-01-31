import React, { useState, useRef, useCallback } from 'react';
import FrameGallery from './components/FrameGallery';
import CanvasComponent from './components/Canvas';
import Controls from './components/Controls';
import './App.css';

const CANVAS_SIZE = 1080;

function App() {
  const [selectedFrame, setSelectedFrame] = useState('/frames/frame12.png');
  const [userPhoto, setUserPhoto] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [photoShape, setPhotoShape] = useState('circle');
  const canvasRef = useRef(null);

  const handlePhotoUpload = useCallback((file) => {
    setUserPhoto({ file, id: Date.now() });
    setZoom(1);
    setRotation(0);
    setPhotoShape('circle');
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setPhotoShape('circle');
    if (canvasRef.current) {
      const userImage = canvasRef.current.getObjects().find(o => o.selectable);
      if (userImage) {
        userImage.set({ left: CANVAS_SIZE / 2, top: CANVAS_SIZE / 2, angle: 0 });
        userImage.setCoords();
        canvasRef.current.renderAll();
      }
    }
  }, []);

  const handleDownload = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.discardActiveObject();
    c.renderAll();
    const multiplier = CANVAS_SIZE / c.getWidth();
    const dataURL = c.toDataURL({ format: 'png', quality: 1, multiplier });
    const link = document.createElement('a');
    link.download = `framed-photo-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  }, []);

  return (
    <div className="app">
      {/* DEBUG: If you see this text, React is working */}
      <div style={{ background: 'red', color: 'white', padding: '10px', textAlign: 'center', fontSize: '18px' }}>
        DEBUG: React App Loaded - If you see this, the app is rendering!
      </div>
      <header className="app-header">
        <div className="header-content">
          <div className="logo"><h1>আমাদের<br />গফরগাঁও</h1></div>
          <nav className="nav-tabs"><button className="nav-tab active">Photo এর ফ্রেম</button></nav>
        </div>
      </header>
      <main className="app-main">
        <div className="canvas-section">
          <CanvasComponent
            selectedFrame={selectedFrame}
            userPhoto={userPhoto}
            zoom={zoom}
            rotation={rotation}
            photoShape={photoShape}
            onPhotoLoaded={() => { }}
            onUpload={handlePhotoUpload}
            canvasRef={canvasRef}
          />
          <FrameGallery selectedFrame={selectedFrame} onSelectFrame={setSelectedFrame} />
        </div>
        <Controls
          zoom={zoom}
          onZoomChange={setZoom}
          rotation={rotation}
          onRotationChange={setRotation}
          photoShape={photoShape}
          onShapeChange={setPhotoShape}
          onReset={handleReset}
          onDownload={handleDownload}
          hasPhoto={!!userPhoto}
        />
      </main>
    </div>
  );
}

export default App;
