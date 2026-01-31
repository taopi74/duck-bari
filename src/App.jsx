import React, { useState, useRef, useCallback } from 'react';
import FrameGallery from './components/FrameGallery';
import CanvasComponent from './components/Canvas';
import Controls from './components/Controls';
import './App.css';

function App() {
  const [selectedFrame, setSelectedFrame] = useState('/frames/frame12.png');
  const [userPhoto, setUserPhoto] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [initialScale, setInitialScale] = useState(1);
  const [photoShape, setPhotoShape] = useState('circle'); // 'circle' or 'square'
  const canvasRef = useRef(null);

  const handlePhotoUpload = useCallback((file) => {
    setUserPhoto(file);
    setZoom(1);
    setRotation(0);
  }, []);

  const handlePhotoLoaded = useCallback((scale) => {
    setInitialScale(scale);
    setZoom(scale);
  }, []);

  const handleReset = useCallback(() => {
    setZoom(initialScale);
    setRotation(0);

    // Reset position to center
    if (canvasRef.current) {
      const objects = canvasRef.current.getObjects();
      const userImage = objects.find(obj => obj.selectable);
      if (userImage) {
        userImage.set({
          left: 540,
          top: 540,
          originX: 'center',
          originY: 'center',
        });
        canvasRef.current.renderAll();
      }
    }
  }, [initialScale]);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;

    // Deselect all objects to hide selection controls
    canvasRef.current.discardActiveObject();
    canvasRef.current.renderAll();

    // Get the canvas at full resolution
    const dataURL = canvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1080 / canvasRef.current.getWidth(),
    });

    // Create download link
    const link = document.createElement('a');
    link.download = `framed-photo-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <h1>আমাদের<br />গফরগাঁও</h1>
          </div>
          <nav className="nav-tabs">
            <button className="nav-tab active">Photo এর ফ্রেম</button>
          </nav>
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
            onPhotoLoaded={handlePhotoLoaded}
            onUpload={handlePhotoUpload}
            canvasRef={canvasRef}
          />

          <FrameGallery
            selectedFrame={selectedFrame}
            onSelectFrame={setSelectedFrame}
          />
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
