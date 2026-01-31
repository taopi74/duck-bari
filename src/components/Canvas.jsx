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
                backgroundColor: '#1a1a2e',
                selection: false,
                allowTouchScrolling: true, // Enable touch events for mobile
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
                const scale = Math.max(scaleX, scaleY);

                console.log('Scale:', scale);

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
                } else {
                    const circleRadius = CANVAS_SIZE * 0.35; // 35% of canvas for circle
                    clipPath = new fabric.Circle({
                        radius: circleRadius,
                        originX: 'center',
                        originY: 'center',
                    });
                }

                // Apply scale and settings
                fabricImg.scale(scale);
                fabricImg.set({
                    selectable: true,
                    hasControls: true,
                    hasBorders: true,
                    lockRotation: false,
                    cornerColor: '#00A651',
                    cornerStrokeColor: '#fff',
                    cornerSize: 12,
                    transparentCorners: false,
                    borderColor: '#00A651',
                    borderScaleFactor: 2,
                    clipPath: clipPath, // Circular clipping
                });

                userImageRef.current = fabricImg;
                canvas.add(fabricImg);

                // Ensure frame stays on top
                if (frameImageRef.current) {
                    canvas.bringToFront(frameImageRef.current);
                }

                canvas.setActiveObject(fabricImg);
                canvas.renderAll();
                setShowPlaceholder(false);
                onPhotoLoaded?.(scale);

                // Expose movePhoto function globally for position controls
                window.movePhoto = (deltaX, deltaY) => {
                    if (userImageRef.current && fabricCanvasRef.current) {
                        const img = userImageRef.current;
                        img.set({
                            left: img.left + deltaX,
                            top: img.top + deltaY,
                        });
                        fabricCanvasRef.current.renderAll();
                    }
                };

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
            // Remove old frame
            if (frameImageRef.current) {
                canvas.remove(frameImageRef.current);
            }

            img.set({
                scaleX: CANVAS_SIZE / img.width,
                scaleY: CANVAS_SIZE / img.height,
                left: 0,
                top: 0,
                originX: 'left',
                originY: 'top',
                selectable: false,
                evented: false,
                hasControls: false,
                hasBorders: false,
            });

            frameImageRef.current = img;
            canvas.add(img);
            canvas.bringObjectToFront(img);
            canvas.renderAll();
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
