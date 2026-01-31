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

    // Load Frame as BACKGROUND layer
    // We put frame at back because it has opaque checkerboard.
    // The photo will be ON TOP but masked to hide the checkerboard.
    useEffect(() => {
        if (!canvas || !selectedFrame) return;

        // Remove old frame object if exists
        if (frameObj) {
            canvas.remove(frameObj);
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
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
            // Send frame to BACK (bottom layer)
            canvas.sendObjectToBack(fabricImg);
            setFrameObj(fabricImg);
            canvas.requestRenderAll();
        };
        img.src = selectedFrame;
    }, [canvas, selectedFrame]);

    // Load User Photo - placed ON TOP but CLIPPED by frame shape
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

                // Calculate target dimensions based on frame config
                let targetWidth, targetHeight;
                if (currentFrameConfig.shape === 'circle') {
                    targetWidth = currentFrameConfig.photoRadius * 2;
                    targetHeight = currentFrameConfig.photoRadius * 2;
                } else {
                    targetWidth = currentFrameConfig.photoWidth;
                    targetHeight = currentFrameConfig.photoHeight;
                }

                // Calculate scale factors for width and height coverage
                const scaleX = targetWidth / fabricImg.width;
                const scaleY = targetHeight / fabricImg.height;

                // "Cover" logic: use the LARGER scale factor ensuring full coverage
                // Added 1.05 multiplier (5% extra) as safety margin
                const baseScale = Math.max(scaleX, scaleY) * 1.05;

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

                // --- KEY FIX: ABSOLUTE CLIPPING ---
                // We create a clip path exactly where the frame hole is supposed to be.
                // This clips the photo so it fits "inside" the frame, even though the photo is physically on top.
                let clipPath;
                if (currentFrameConfig.shape === 'circle') {
                    clipPath = new fabric.Circle({
                        radius: currentFrameConfig.photoRadius,
                        left: currentFrameConfig.photoX,
                        top: currentFrameConfig.photoY,
                        originX: 'center',
                        originY: 'center',
                        absolutePositioned: true, // Crucial: clips relative to canvas, not photo
                    });
                } else {
                    clipPath = new fabric.Rect({
                        width: currentFrameConfig.photoWidth,
                        height: currentFrameConfig.photoHeight,
                        left: currentFrameConfig.photoX,
                        top: currentFrameConfig.photoY,
                        rx: currentFrameConfig.cornerRadius || 0, // Rounded corners X
                        ry: currentFrameConfig.cornerRadius || 0, // Rounded corners Y
                        originX: 'center',
                        originY: 'center',
                        absolutePositioned: true,
                    });
                }

                fabricImg.clipPath = clipPath;

                canvas.add(fabricImg);

                // Bring Photo to FRONT so it covers the opaque checkerboard
                canvas.bringObjectToFront(fabricImg);

                canvas.setActiveObject(fabricImg);
                setPhotoObj(fabricImg);
                setShowPlaceholder(false);

                if (onPhotoLoaded) onPhotoLoaded();
                URL.revokeObjectURL(url);
                canvas.requestRenderAll();
                console.log('[DEBUG] Photo loaded on TOP with absolute clipping');

            } catch (error) {
                console.error('Error creating fabric image:', error);
            }
        };

        img.src = url;
    }, [canvas, userPhoto, onPhotoLoaded, currentFrameConfig, selectedFrame]);

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
