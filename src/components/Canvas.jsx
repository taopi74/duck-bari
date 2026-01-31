import React, { useRef, useEffect, useCallback, useState } from 'react';
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
    const fabricCanvasRef = useRef(null);
    const userImageRef = useRef(null);
    const frameImageRef = useRef(null);
    const fileInputRef = useRef(null);
    const [showPlaceholder, setShowPlaceholder] = useState(true);

    // Initialize Fabric canvas
    useEffect(() => {
        if (!canvasElRef.current) return;

        let canvas;
        try {
            canvas = new fabric.Canvas(canvasElRef.current, {
                width: CANVAS_SIZE,
                height: CANVAS_SIZE,
                backgroundColor: null, // Transparent background to prevent "black" look
                selection: false,
                allowTouchScrolling: false, // Disable touch scrolling to ensure image dragging works
                preserveObjectStacking: true, // Key for layering
                controlsAboveOverlay: true, // Allow selecting objects BEHIND the overlay
            });
        } catch (error) {
            console.warn('Canvas initialization failed or already initialized:', error);
            return;
        }

        fabricCanvasRef.current = canvas;
        if (externalCanvasRef) {
            externalCanvasRef.current = canvas;
        }

        // Handle responsive sizing
        const resizeCanvas = () => {
            if (!containerRef.current) return;
            const containerWidth = containerRef.current.offsetWidth;
            const scale = containerWidth / CANVAS_SIZE;
            canvas.setZoom(scale);
            canvas.setDimensions({ width: containerWidth, height: containerWidth });
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            canvas.dispose();
        };
    }, [externalCanvasRef]);

    // Load user photo
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas || !userPhoto) return;

        console.log('Loading user photo:', userPhoto.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            const imgElement = new Image();
            imgElement.onload = () => {
                console.log('Image loaded:', imgElement.width, 'x', imgElement.height);

                // Remove old user image
                if (userImageRef.current) {
                    canvas.remove(userImageRef.current);
                }

                // Create Fabric image from loaded image element
                const fabricImg = new fabric.FabricImage(imgElement, {
                    left: CANVAS_SIZE / 2,
                    top: CANVAS_SIZE / 2,
                    originX: 'center',
                    originY: 'center',
                });

                // Calculate scale to cover canvas
                const scaleX = CANVAS_SIZE / fabricImg.width;
                const scaleY = CANVAS_SIZE / fabricImg.height;
                // User prefers a smaller initial scale (0.6x) and range 0.4-0.8
                const scale = Math.max(scaleX, scaleY) * 0.6;

                // Create clip path based on shape
                let clipPath;
                if (photoShape === 'square') {
                    const squareSize = CANVAS_SIZE * 0.7; // 70% of canvas for square
                    clipPath = new fabric.Rect({
                        width: squareSize,
                        height: squareSize,
                        originX: 'center',
                        originY: 'center',
                    });
                } else if (photoShape === 'circle') {
                    const circleRadius = CANVAS_SIZE * 0.35; // 35% of canvas for circle
                    clipPath = new fabric.Circle({
                        radius: circleRadius,
                        originX: 'center',
                        originY: 'center',
                    });
                } else {
                    // 'original' - no clipping, just standard rectangle
                    clipPath = null;
                }

                // Apply scale and settings
                // Apply scale and settings
                fabricImg.scale(scale);

                const imgOptions = {
                    selectable: true,
                    evented: true,
                    hasControls: true,
                    hasBorders: true,
                    lockRotation: false,
                    cornerColor: '#00A651',
                    cornerStrokeColor: '#fff',
                    cornerSize: 24,
                    transparentCorners: false,
                    borderColor: '#00A651',
                    borderScaleFactor: 2,
                };

                if (clipPath) {
                    imgOptions.clipPath = clipPath;
                } else {
                    // Explicitly remove any existing clipPath (though new image shouldn't have one)
                    imgOptions.clipPath = null;
                }

                fabricImg.set(imgOptions);

                userImageRef.current = fabricImg;
                canvas.add(fabricImg);

                // IMPORTANT: Send to back so it sits behind the overlay (but controls render on top)
                canvas.sendToBack(fabricImg);

                canvas.setActiveObject(fabricImg);
                canvas.renderAll();
                setShowPlaceholder(false);
                onPhotoLoaded?.(scale);

                console.log('Photo loaded successfully');
            };

            imgElement.onerror = () => {
                console.error('Failed to load image');
                alert('ছবি লোড করতে সমস্যা হয়েছে।');
            };

            imgElement.src = e.target.result;
        };

        reader.onerror = () => {
            console.error('FileReader error');
            alert('ফাইল পড়তে সমস্যা হয়েছে।');
        };

        reader.readAsDataURL(userPhoto);
    }, [userPhoto, onPhotoLoaded]);

    // Load frame overlay
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas || !selectedFrame) return;

        fabric.FabricImage.fromURL(selectedFrame).then((img) => {
            img.set({
                scaleX: CANVAS_SIZE / img.width,
                scaleY: CANVAS_SIZE / img.height,
                left: 0,
                top: 0,
                originX: 'left',
                originY: 'top',
                selectable: false,
                evented: false,
            });

            // Set as OVERLAY image instead of a regular object
            // This allows controlsAboveOverlay to work
            canvas.setOverlayImage(img, canvas.renderAll.bind(canvas));
            frameImageRef.current = img; // Keep ref just in case
        });
    }, [selectedFrame]);

    // Update zoom
    useEffect(() => {
        const img = userImageRef.current;
        const canvas = fabricCanvasRef.current;
        if (!img || !canvas) return;

        img.scale(zoom);
        canvas.renderAll();
    }, [zoom]);

    // Update rotation
    useEffect(() => {
        const img = userImageRef.current;
        const canvas = fabricCanvasRef.current;
        if (!img || !canvas) return;

        img.set('angle', rotation);
        canvas.renderAll();
    }, [rotation]);

    const handleFileChange = (e) => {
        console.log('File input changed:', e.target.files);
        const file = e.target.files[0];
        if (file && onUpload) {
            console.log('Uploading file:', file.name);
            onUpload(file);
        } else {
            console.log('No file selected or onUpload missing');
        }
        e.target.value = '';
    };

    return (
        <div className="canvas-container">
            <input
                type="file"
                ref={fileInputRef}
                className="file-input-hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
            />
            <div className="canvas-wrapper">
                <div className="canvas-inner" ref={containerRef}>
                    <canvas ref={canvasElRef} />
                    <div className={`upload-placeholder ${!showPlaceholder ? 'hidden' : ''}`}>
                        <button
                            className="upload-btn-overlay"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            ছবি নির্বাচন করুন
                        </button>
                    </div>
                    {!showPlaceholder && (
                        <button
                            className="change-photo-btn"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            📷 ছবি পরিবর্তন করুন
                        </button>
                    )}
                </div>
                <div className="canvas-instructions">
                    <strong>📌 নির্দেশনা:</strong> ছবি আপলোড করুন → ফ্রেম নির্বাচন করুন → ছবি টেনে সরান বা কন্ট্রোল ব্যবহার করুন
                </div>
            </div>
        </div>
    );
}

export default CanvasComponent;
