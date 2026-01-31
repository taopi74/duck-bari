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
            controlsAboveOverlay: true,
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

    // Load Frame as Overlay
    useEffect(() => {
        if (!canvas || !selectedFrame) return;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const fabricImg = new fabric.FabricImage(img);
            fabricImg.set({
                scaleX: CANVAS_SIZE / fabricImg.width,
                scaleY: CANVAS_SIZE / fabricImg.height,
                left: 0, top: 0,
                originX: 'left', originY: 'top',
                selectable: false, evented: false,
            });
            canvas.overlayImage = fabricImg;
            canvas.requestRenderAll();
        };
        img.src = selectedFrame;
    }, [canvas, selectedFrame]);

    // Load User Photo - using frame-specific position
    useEffect(() => {
        console.log('[DEBUG] Photo useEffect triggered, userPhoto:', userPhoto);
        if (!canvas || !userPhoto?.file) {
            console.log('[DEBUG] Early return - canvas:', !!canvas, 'userPhoto:', !!userPhoto);
            return;
        }
        console.log('[DEBUG] Starting photo load with frame config:', currentFrameConfig);
        canvas.getObjects().forEach(obj => {
            if (obj.selectable) canvas.remove(obj);
        });
        const url = URL.createObjectURL(userPhoto.file);
        console.log('[DEBUG] Blob URL created:', url);
        const img = new Image();
        img.onload = () => {
            console.log('[DEBUG] Image loaded! Dimensions:', img.width, 'x', img.height);
            const fabricImg = new fabric.FabricImage(img);

            // Calculate scale based on frame's transparent area size
            let targetSize;
            if (currentFrameConfig.shape === 'circle') {
                targetSize = currentFrameConfig.photoRadius * 2; // diameter
            } else {
                targetSize = Math.max(currentFrameConfig.photoWidth, currentFrameConfig.photoHeight);
            }

            const baseScale = Math.max(
                targetSize / fabricImg.width,
                targetSize / fabricImg.height
            );

            fabricImg.baseScale = baseScale;
            fabricImg.set({
                // Use frame-specific position
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
            canvas.add(fabricImg);
            canvas.sendObjectToBack(fabricImg);
            canvas.setActiveObject(fabricImg);
            setPhotoObj(fabricImg);
            setShowPlaceholder(false);
            console.log('[DEBUG] Photo added at position:', currentFrameConfig.photoX, currentFrameConfig.photoY);
            if (onPhotoLoaded) onPhotoLoaded();
            URL.revokeObjectURL(url);
            canvas.requestRenderAll();
        };
        img.onerror = (err) => {
            console.error('[DEBUG] Image load FAILED:', err);
            alert('ছবি লোড করতে সমস্যা!');
            URL.revokeObjectURL(url);
        };
        img.src = url;
    }, [canvas, userPhoto, onPhotoLoaded, currentFrameConfig]);

    // Sync Controls and reposition when frame changes
    useEffect(() => {
        if (!canvas || !photoObj || !photoObj.baseScale) return;

        // Recalculate scale based on current frame's transparent area
        let targetSize;
        if (currentFrameConfig.shape === 'circle') {
            targetSize = currentFrameConfig.photoRadius * 2;
        } else {
            targetSize = Math.max(currentFrameConfig.photoWidth, currentFrameConfig.photoHeight);
        }

        const newBaseScale = Math.max(
            targetSize / photoObj.width,
            targetSize / photoObj.height
        );

        photoObj.baseScale = newBaseScale;
        const effectiveScale = newBaseScale * zoom;

        photoObj.set({
            left: currentFrameConfig.photoX,
            top: currentFrameConfig.photoY,
            scaleX: effectiveScale,
            scaleY: effectiveScale,
            angle: rotation
        });

        if (photoShape === 'circle') {
            photoObj.set('clipPath', new fabric.Circle({
                radius: photoObj.width / 2,
                originX: 'center',
                originY: 'center',
            }));
        } else if (photoShape === 'square') {
            const size = Math.min(photoObj.width, photoObj.height);
            photoObj.set('clipPath', new fabric.Rect({
                width: size,
                height: size,
                originX: 'center',
                originY: 'center',
            }));
        } else {
            photoObj.set('clipPath', null);
        }
        photoObj.setCoords();
        canvas.requestRenderAll();
    }, [canvas, photoObj, zoom, rotation, photoShape, currentFrameConfig]);

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
