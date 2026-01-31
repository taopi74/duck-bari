import React, { useRef, useEffect, useState } from 'react';
import * as fabric from 'fabric';
import './Canvas.css';

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
    const containerRef = useRef(null);
    const canvasElRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [photoObj, setPhotoObj] = useState(null);
    const fileInputRef = useRef(null);
    const [showPlaceholder, setShowPlaceholder] = useState(true);

    // 1. Initialize Canvas
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

    // 2. Load Frame as Overlay
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

    // 3. Load User Photo
    useEffect(() => {
        if (!canvas || !userPhoto?.file) return;

        // Clean up old selectable objects
        canvas.getObjects().forEach(obj => {
            if (obj.selectable) canvas.remove(obj);
        });

        console.log('[DEBUG] userPhoto effect triggered, userPhoto:', userPhoto);
        const url = URL.createObjectURL(userPhoto.file);
        const img = new Image();
        img.onload = () => {
            console.log('[DEBUG] Image loaded successfully');
            const fabricImg = new fabric.FabricImage(img);

            // Calculate base scale (auto-fit 70%)
            const baseScale = Math.max(
                (CANVAS_SIZE * 0.7) / fabricImg.width,
                (CANVAS_SIZE * 0.7) / fabricImg.height
            );

            // Store baseScale on the object for later use
            fabricImg.baseScale = baseScale;

            fabricImg.set({
                left: CANVAS_SIZE / 2,
                top: CANVAS_SIZE / 2,
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
            canvas.sendToBack(fabricImg);
            canvas.setActiveObject(fabricImg);

            setPhotoObj(fabricImg);
            setShowPlaceholder(false);
            onPhotoLoaded?.();

            URL.revokeObjectURL(url);
            canvas.requestRenderAll();
        };
        img.onerror = (err) => {
            console.error('[DEBUG] Image load FAILED:', err);
            alert("ছবি লোড করতে সমস্যা হয়েছে।");
            URL.revokeObjectURL(url);
        };
        img.src = url;
    }, [canvas, userPhoto, onPhotoLoaded]);

    // 4. Sync Controls (Zoom as multiplier, Relative ClipPath)
    useEffect(() => {
        if (!canvas || !photoObj || !photoObj.baseScale) return;

        // Apply zoom as MULTIPLIER of baseScale
        const effectiveScale = photoObj.baseScale * zoom;
        photoObj.set({
            scaleX: effectiveScale,
            scaleY: effectiveScale,
            angle: rotation
        });

        // Relative ClipPath (moves WITH the image)
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
    }, [canvas, photoObj, zoom, rotation, photoShape]);

    const handleFileChange = (e) => {
        console.log('[DEBUG] File input change event triggered');
        const file = e.target.files[0];
        console.log('[DEBUG] Selected file:', file);
        if (file && onUpload) {
            console.log('[DEBUG] Calling onUpload callback');
            onUpload(file);
        }
        e.target.value = '';
    };

    return (
        <div className="canvas-container">
            <input type="file" ref={fileInputRef} className="file-input-hidden" accept="image/*" onChange={handleFileChange} />
            <div className="canvas-wrapper">
                <div className="canvas-inner" ref={containerRef}>
                    <canvas ref={canvasElRef} />
                    {showPlaceholder && (
                        <div className="upload-placeholder">
                            <button className="upload-btn-overlay" onClick={() => fileInputRef.current?.click()}>
                                ছবি নির্বাচন করুন
                            </button>
                        </div>
                    )}
                    {!showPlaceholder && (
                        <button className="change-photo-btn" onClick={() => fileInputRef.current?.click()}>
                            📷 পরিবর্তন
                        </button>
                    )}
                </div>
                <div className="canvas-instructions">
                    <strong>📌 নির্দেশনা:</strong> ছবি সঠিক স্থানে বসাতে ছোট-বড় বা ড্র্যাগ করুন।
                </div>
            </div>
        </div>
    );
}

export default CanvasComponent;
