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
  const [photoShape, setPhotoShape] = useState('original'); // 'original', 'circle', or 'square'
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

  const handleMove = useCallback((direction) => {
    console.log('handleMove called:', direction);
    if (!canvasRef.current) {
      console.error('No canvasRef');
      return;
    }

    const canvas = canvasRef.current;
    const activeObj = canvas.getActiveObject();
    console.log('Active Object:', activeObj);

    // If no active object, try to find the user image (it should be the only selectable one)
    const objects = canvas.getObjects();
    console.log('All Objects:', objects.length, objects);

    const targetObj = activeObj || objects.find(obj => obj.selectable);
    console.log('Target Object:', targetObj);

    if (targetObj) {
      const step = 20; // Larger step size for 1080p canvas

      let deltaX = 0;
      let deltaY = 0;

      switch (direction) {
        case 'up': deltaY = -step; break;
        case 'down': deltaY = step; break;
        case 'left': deltaX = -step; break;
        case 'right': deltaX = step; break;
        default: break;
      }

      console.log('Moving by:', deltaX, deltaY);

      targetObj.set({
        left: targetObj.left + deltaX,
        top: targetObj.top + deltaY,
      });
      targetObj.setCoords();
      canvas.setActiveObject(targetObj); // Force selection so user sees it moving
      canvas.requestRenderAll(); // Better for animation/updates
      console.log('Moved to:', targetObj.left, targetObj.top);
    } else {
      console.warn('No target object found to move');
    }
  }, []);

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
          onMove={handleMove}
          onDownload={handleDownload}
          hasPhoto={!!userPhoto}
        />
      </main>
    </div>
  );
}

export default App;
