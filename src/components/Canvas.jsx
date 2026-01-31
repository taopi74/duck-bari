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

    // Load Frame as Background + Overlay
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
            // Store for both background and overlay rendering
            canvas.frameImage = fabricImg;
            canvas.backgroundColor = '#ffffff';
            
            // Custom render to place frame AFTER objects
            canvas.renderAll = (function(original) {
                return function() {
                    original.call(this);
                    // Draw frame on top after all objects
                    if (canvas.frameImage && canvas.contextTop) {
                        canvas.contextTop.drawImage(
                            canvas.frameImage._element,
                            0, 0,
                            CANVAS_SIZE, CANVAS_SIZE
                        );
                    }
                };
            })(canvas.renderAll);
            
            canvas.requestRenderAll();
            console.log('[v0] Frame loaded and positioned on top');
        };
        img.src = selectedFrame;
    }, [canvas, selectedFrame]);

    // Load User Photo
    useEffect(() => {
        console.log('[v0] Photo useEffect triggered, userPhoto:', userPhoto);
        if (!canvas || !userPhoto?.file) {
            console.log('[v0] Early return - canvas:', !!canvas, 'userPhoto:', !!userPhoto);
            return;
        }
        console.log('[v0] Starting photo load...');
        
        // Remove only the previous photo, not all objects
        const existingPhoto = canvas.getObjects().find(obj => obj._isUserPhoto);
        if (existingPhoto) {
            canvas.remove(existingPhoto);
        }
        
        const url = URL.createObjectURL(userPhoto.file);
        console.log('[v0] Blob URL created:', url);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            console.log('[v0] Image loaded! Dimensions:', img.width, 'x', img.height);
            const fabricImg = new fabric.FabricImage(img);
            const baseScale = Math.max(
                (CANVAS_SIZE * 0.7) / fabricImg.width,
                (CANVAS_SIZE * 0.7) / fabricImg.height
            );
            fabricImg.baseScale = baseScale;
            fabricImg._isUserPhoto = true;
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
            canvas.sendObjectToBack(fabricImg);
            canvas.setActiveObject(fabricImg);
            setPhotoObj(fabricImg);
            setShowPlaceholder(false);
            console.log('[v0] Photo added to canvas, placeholder hidden');
            if (onPhotoLoaded) onPhotoLoaded();
            canvas.requestRenderAll();
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);
        };
        
        img.onerror = (err) => {
            console.error('[v0] Image load FAILED:', err);
            alert('ছবি লোড করতে সমস্যা!');
            URL.revokeObjectURL(url);
        };
        
        img.src = url;
    }, [canvas, userPhoto, onPhotoLoaded]);

    // Sync Controls
    useEffect(() => {
        if (!canvas || !photoObj || !photoObj.baseScale) return;
        const effectiveScale = photoObj.baseScale * zoom;
        photoObj.set({
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
    }, [canvas, photoObj, zoom, rotation, photoShape]);

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
