import React, { useRef, useEffect, useState } from 'react';
import * as fabric from 'fabric';
import './Canvas.css';
import { frames } from './FrameGallery';

const CANVAS_SIZE = 1080;

function CanvasComponent({
    selectedFrame,
    userPhoto,
    zoom,
    rotation,
    photoShape,
    onPhotoLoaded,
    onUpload,
    canvasRef: externalCanvasRef
}) {
    // Find the current frame config based on selectedFrame
    const currentFrameConfig = frames.find(f => f.src === selectedFrame) || frames[0];
    const containerRef = useRef(null);
    const canvasElRef = useRef(null);
    const fileInputRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [photoObj, setPhotoObj] = useState(null);
    const [frameObj, setFrameObj] = useState(null);
    const [showPlaceholder, setShowPlaceholder] = useState(true);

    // Initialize Canvas
    useEffect(() => {
        if (!canvasElRef.current) return;
        const c = new fabric.Canvas(canvasElRef.current, {
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            backgroundColor: '#ffffff',
            selection: false,
            preserveObjectStacking: true,
        });
        setCanvas(c);
        if (externalCanvasRef) externalCanvasRef.current = c;

        const resize = () => {
            if (!containerRef.current) return;
            const w = containerRef.current.offsetWidth;
            c.setZoom(w / CANVAS_SIZE);
            c.setDimensions({ width: w, height: w });
        };
        resize();
        window.addEventListener('resize', resize);
        return () => {
            window.removeEventListener('resize', resize);
            c.dispose();
        };
    }, [externalCanvasRef]);

    // Load Frame as TOP layer (Overlay)
    useEffect(() => {
        if (!canvas || !selectedFrame) return;

        // Remove old frame object if exists
        // Note: In this strategy, Frame is ALWAYS ON TOP
        if (frameObj) {
            canvas.remove(frameObj);
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        // Add a timestamp to bypass browser cache since we just modified the images
        img.src = selectedFrame + '?t=' + new Date().getTime();

        img.onload = () => {
            const fabricImg = new fabric.FabricImage(img);
            fabricImg.set({
                scaleX: CANVAS_SIZE / fabricImg.width,
                scaleY: CANVAS_SIZE / fabricImg.height,
                left: 0,
                top: 0,
                originX: 'left',
                originY: 'top',
                selectable: false,
                evented: false,
                isFrame: true,
            });

            canvas.add(fabricImg);
            canvas.bringObjectToFront(fabricImg); // Ensure frame is ON TOP
            setFrameObj(fabricImg);
            canvas.requestRenderAll();
        };
    }, [canvas, selectedFrame]);

    // Load User Photo - BEHIND the frame
    useEffect(() => {
        console.log('[DEBUG] Photo useEffect triggered, userPhoto:', userPhoto);
        if (!canvas || !userPhoto?.file) return;

        // Remove existing user photos
        canvas.getObjects().forEach(obj => {
            if (obj.selectable && !obj.isFrame) {
                canvas.remove(obj);
            }
        });

        const url = URL.createObjectURL(userPhoto.file);
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            try {
                const fabricImg = new fabric.FabricImage(img);

                // Simple Auto-Fit Logic
                // We target a reasonably large size to cover the hole, 
                // e.g. 600px or based on the hole size if we want.
                // Since it's behind the frame, being 'too big' is fine (it gets hidden).
                // Being 'too small' shows white background.

                // Let's target the approximate hole size we know
                let targetSize = 650; // Safe default big enough for all frames
                if (currentFrameConfig.photoRadius) targetSize = currentFrameConfig.photoRadius * 2.5;
                if (currentFrameConfig.photoWidth) targetSize = Math.max(currentFrameConfig.photoWidth, currentFrameConfig.photoHeight) * 1.2;

                const baseScale = Math.max(
                    targetSize / fabricImg.width,
                    targetSize / fabricImg.height
                );

                fabricImg.baseScale = baseScale;
                fabricImg.set({
                    left: currentFrameConfig.photoX,
                    top: currentFrameConfig.photoY,
                    originX: 'center',
                    originY: 'center',
                    scaleX: baseScale,
                    scaleY: baseScale,
                    selectable: true,
                    evented: true,
                    cornerColor: '#00A651',
                    cornerStrokeColor: '#fff',
                    cornerSize: 36,
                    transparentCorners: false,
                    borderColor: '#00A651',
                });

                // NO CLIP PATH NEEDED ANYMORE!
                // The frame itself has transparency now.

                canvas.add(fabricImg);

                // Send Photo to BACK
                canvas.sendObjectToBack(fabricImg);

                // Ensure frame stays on top
                if (frameObj) {
                    canvas.bringObjectToFront(frameObj);
                }

                canvas.setActiveObject(fabricImg);
                setPhotoObj(fabricImg);
                setShowPlaceholder(false);

                if (onPhotoLoaded) onPhotoLoaded();
                URL.revokeObjectURL(url);
                canvas.requestRenderAll();
                console.log('[DEBUG] Photo loaded behind frame');

            } catch (error) {
                console.error('Error creating fabric image:', error);
            }
        };

        img.src = url;
    }, [canvas, userPhoto, onPhotoLoaded, currentFrameConfig, selectedFrame, frameObj]);

    // Sync Controls
    useEffect(() => {
        if (!canvas || !photoObj || !photoObj.baseScale) return;

        const effectiveScale = photoObj.baseScale * zoom;

        photoObj.set({
            scaleX: effectiveScale,
            scaleY: effectiveScale,
            angle: rotation
        });

        photoObj.setCoords();
        canvas.requestRenderAll();
    }, [canvas, photoObj, zoom, rotation]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && onUpload) onUpload(file);
        e.target.value = '';
    };

    return (
        <div className="canvas-container">
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
            <div className="canvas-wrapper">
                <div className="canvas-inner" ref={containerRef}>
                    <canvas ref={canvasElRef} />
                    {showPlaceholder && (
                        <div className="upload-placeholder">
                            <button className="upload-btn-overlay" onClick={() => fileInputRef.current?.click()}>
                                📷 ছবি নির্বাচন করুন
                            </button>
                        </div>
                    )}
                    {!showPlaceholder && (
                        <button className="change-photo-btn" onClick={() => fileInputRef.current?.click()}>
                            📷 পরিবর্তন
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CanvasComponent;
