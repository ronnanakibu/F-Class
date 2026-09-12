'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Check,
  Crop as CropIcon,
  Move,
} from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  studentName: string;
  studentId: string | number;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => Promise<void> | void;
  isSaving?: boolean;
}

const VIEWPORT_SIZE = 260; // Size in pixels of the crop circle on screen
const OUTPUT_SIZE = 512;   // High-res output square size

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  studentName,
  studentId,
  onClose,
  onCropComplete,
  isSaving = false,
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  const imageRef = useRef<HTMLImageElement>(null);
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset transforms when new image is loaded
  useEffect(() => {
    if (imageSrc) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setImageLoaded(false);
    }
  }, [imageSrc]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setImageLoaded(true);
  };

  // Base scale so image fills the 260px viewport
  const baseScale = imageLoaded && imageNaturalSize.width && imageNaturalSize.height
    ? Math.max(
        VIEWPORT_SIZE / imageNaturalSize.width,
        VIEWPORT_SIZE / imageNaturalSize.height
      )
    : 1;

  // Pointer drag events (Mouse & Touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.0015;
    setZoom((prev) => Math.min(Math.max(prev + zoomDelta, 1), 3));
  };

  // Reset adjustments
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Rotate 90 deg clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Render to 512x512 Canvas and export
  const handleConfirmCrop = useCallback(() => {
    const img = imageRef.current;
    if (!img || !imageLoaded) return;

    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    const scaleFactor = OUTPUT_SIZE / VIEWPORT_SIZE;

    ctx.save();
    // Move to canvas center + scaled pan
    ctx.translate(
      OUTPUT_SIZE / 2 + pan.x * scaleFactor,
      OUTPUT_SIZE / 2 + pan.y * scaleFactor
    );
    // Rotate
    ctx.rotate((rotation * Math.PI) / 180);
    // Scale
    const totalScale = baseScale * zoom * scaleFactor;
    ctx.scale(totalScale, totalScale);

    // Draw image centered at origin
    ctx.drawImage(
      img,
      -imageNaturalSize.width / 2,
      -imageNaturalSize.height / 2,
      imageNaturalSize.width,
      imageNaturalSize.height
    );
    ctx.restore();

    // Export as high-quality JPEG blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      'image/jpeg',
      0.92
    );
  }, [imageLoaded, pan, rotation, zoom, baseScale, imageNaturalSize, onCropComplete]);

  if (!isOpen || !imageSrc) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-bg-elevated border border-border-accent/40 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                <CropIcon size={18} />
              </div>
              <div>
                <h3 className="text-sm font-heading font-bold text-text-primary">
                  Sesuaikan & Crop Foto
                </h3>
                <p className="text-xs text-text-muted">
                  {studentName} (#{studentId})
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="p-1 rounded-lg text-text-dim hover:text-text-primary transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Crop Viewport */}
          <div className="relative flex flex-col items-center justify-center my-2 select-none">
            <div
              style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
              onWheel={handleWheel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="relative overflow-hidden rounded-full cursor-grab active:cursor-grabbing border-2 border-accent shadow-[0_0_25px_rgba(0,240,255,0.25)] bg-[#08090C]"
            >
              {/* The Image being transformed */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px)`,
                }}
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop preview"
                  onLoad={handleImageLoad}
                  crossOrigin="anonymous"
                  draggable={false}
                  style={{
                    transform: `rotate(${rotation}deg) scale(${baseScale * zoom})`,
                    transformOrigin: 'center center',
                    maxWidth: 'none',
                    maxHeight: 'none',
                  }}
                  className="transition-transform duration-75 ease-out select-none pointer-events-none"
                />
              </div>

              {/* Rule-of-thirds subtle guide lines */}
              <div className="absolute inset-0 pointer-events-none opacity-20 grid grid-cols-3 grid-rows-3">
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-white" />
                <div className="border-r border-white" />
                <div />
              </div>
            </div>

            {/* Helper label */}
            <p className="text-[11px] font-mono text-text-dim mt-2 flex items-center gap-1">
              <Move size={12} />
              <span>Geser untuk memposisikan wajah di dalam lingkaran</span>
            </p>
          </div>

          {/* Control Tools */}
          <div className="bg-bg-surface/50 border border-border/60 rounded-2xl p-3.5 mt-3 space-y-3">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(prev - 0.2, 1))}
                className="p-1 text-text-dim hover:text-accent transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>

              <input
                type="range"
                min="1"
                max="3"
                step="0.02"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-accent h-1.5 bg-bg-elevated rounded-lg cursor-pointer"
              />

              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(prev + 0.2, 3))}
                className="p-1 text-text-dim hover:text-accent transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>

              <span className="font-mono text-xs text-text-muted w-10 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Rotation & Reset Buttons */}
            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <button
                type="button"
                onClick={handleRotate}
                className="px-2.5 py-1.5 rounded-lg bg-bg-elevated hover:bg-bg-elevated/80 border border-border hover:border-accent/40 text-xs font-mono text-text-muted hover:text-accent transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCw size={13} />
                <span>Putar 90°</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1.5 rounded-lg bg-bg-elevated hover:bg-bg-elevated/80 border border-border text-xs font-mono text-text-dim hover:text-text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-2.5 px-4 rounded-xl border border-border text-xs font-heading font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmCrop}
              disabled={isSaving || !imageLoaded}
              className="flex-1 py-2.5 px-4 rounded-xl bg-accent hover:bg-accent/90 text-bg-primary text-xs font-heading font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(0,240,255,0.25)]"
            >
              <Check size={15} />
              <span>{isSaving ? 'Menyimpan...' : 'Terapkan & Simpan'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
