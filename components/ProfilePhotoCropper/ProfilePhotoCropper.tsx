"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./ProfilePhotoCropper.module.css";

interface ProfilePhotoCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob, croppedDataUrl: string) => void;
  onCancel: () => void;
  isUploading?: boolean;
}

export default function ProfilePhotoCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  isUploading = false,
}: ProfilePhotoCropperProps) {
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(0); // in degrees: 0, 90, 180, 270
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const imageRef = useRef<HTMLImageElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reset to initial framing
  const handleReset = () => {
    setZoom(1.0);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Rotation controls
  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Drag / Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Update Live Preview Canvas
  const updatePreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    const img = imageRef.current;
    const viewport = viewportRef.current;
    if (!canvas || !img || !viewport) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const exportWidth = 800;
    const exportHeight = 1000; // 4:5 ratio

    canvas.width = exportWidth;
    canvas.height = exportHeight;

    ctx.clearRect(0, 0, exportWidth, exportHeight);
    ctx.save();

    // Move to center of canvas
    ctx.translate(exportWidth / 2, exportHeight / 2);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Scale mapping from viewport to export dimensions
    const viewportRect = viewport.getBoundingClientRect();
    const scaleFactor = exportWidth / (viewportRect.width || 320);

    // Apply pan offset
    const isRotated90or270 = rotation === 90 || rotation === 270;
    const effectiveX = isRotated90or270 ? (rotation === 90 ? position.y : -position.y) : (rotation === 180 ? -position.x : position.x);
    const effectiveY = isRotated90or270 ? (rotation === 90 ? -position.x : position.x) : (rotation === 180 ? -position.y : position.y);

    ctx.translate(effectiveX * scaleFactor, effectiveY * scaleFactor);

    // Calculate image base scale to cover viewport
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const frameAspect = isRotated90or270 ? 5 / 4 : 4 / 5;

    let drawWidth: number;
    let drawHeight: number;

    if (imgAspect > frameAspect) {
      drawHeight = exportHeight * zoom;
      drawWidth = drawHeight * imgAspect;
    } else {
      drawWidth = exportWidth * zoom;
      drawHeight = drawWidth / imgAspect;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }, [position, zoom, rotation]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  // Generate cropped output blob
  const handleSave = () => {
    const canvas = document.createElement("canvas");
    const img = imageRef.current;
    const viewport = viewportRef.current;
    if (!img || !viewport) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const exportWidth = 800;
    const exportHeight = 1000; // 4:5 high quality

    canvas.width = exportWidth;
    canvas.height = exportHeight;

    ctx.clearRect(0, 0, exportWidth, exportHeight);
    ctx.save();

    ctx.translate(exportWidth / 2, exportHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const viewportRect = viewport.getBoundingClientRect();
    const scaleFactor = exportWidth / (viewportRect.width || 320);

    const isRotated90or270 = rotation === 90 || rotation === 270;
    const effectiveX = isRotated90or270 ? (rotation === 90 ? position.y : -position.y) : (rotation === 180 ? -position.x : position.x);
    const effectiveY = isRotated90or270 ? (rotation === 90 ? -position.x : position.x) : (rotation === 180 ? -position.y : position.y);

    ctx.translate(effectiveX * scaleFactor, effectiveY * scaleFactor);

    const imgAspect = img.naturalWidth / img.naturalHeight;
    const frameAspect = isRotated90or270 ? 5 / 4 : 4 / 5;

    let drawWidth: number;
    let drawHeight: number;

    if (imgAspect > frameAspect) {
      drawHeight = exportHeight * zoom;
      drawWidth = drawHeight * imgAspect;
    } else {
      drawWidth = exportWidth * zoom;
      drawHeight = drawWidth / imgAspect;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const dataUrl = canvas.toDataURL("image/webp", 0.92);
          onCropComplete(blob, dataUrl);
        }
      },
      "image/webp",
      0.92
    );
  };

  return (
    <div className={styles.editorContainer}>
      {/* Left: Interactive Crop Framing */}
      <div className={styles.cropperPanel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Adjust Framing & Position
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Ratio: 4:5
          </span>
        </div>

        {/* 4:5 Viewport */}
        <div
          ref={viewportRef}
          className={styles.cropViewport}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Crop source"
            className={styles.cropImage}
            onLoad={updatePreview}
            style={{
              transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`,
              maxWidth: 'none',
              maxHeight: 'none',
            }}
          />
          <div className={styles.cropGuideLines}>
            <div /><div /><div />
            <div /><div /><div />
            <div /><div /><div />
          </div>
        </div>

        {/* Zoom & Rotation Controls */}
        <div className={styles.controlsGroup}>
          <div className={styles.controlRow}>
            <span className={styles.controlLabel}>Zoom</span>
            <div className={styles.sliderTrack}>
              <button
                type="button"
                className={styles.stepBtn}
                onClick={() => setZoom((z) => Math.max(1.0, parseFloat((z - 0.1).toFixed(2))))}
              >
                -
              </button>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className={styles.sliderInput}
              />
              <button
                type="button"
                className={styles.stepBtn}
                onClick={() => setZoom((z) => Math.min(3.0, parseFloat((z + 0.1).toFixed(2))))}
              >
                +
              </button>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', minWidth: '35px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                {zoom.toFixed(1)}x
              </span>
            </div>
          </div>

          <div className={styles.controlRow}>
            <span className={styles.controlLabel}>Rotate</span>
            <div className={styles.btnRow}>
              <button type="button" className={styles.actionBtn} onClick={handleRotateLeft}>
                ↶ Rotate Left (-90°)
              </button>
              <button type="button" className={styles.actionBtn} onClick={handleRotateRight}>
                ↷ Rotate Right (+90°)
              </button>
              <button type="button" className={styles.actionBtn} onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Live Profile Card Preview */}
      <div className={styles.previewPanel}>
        <div className={styles.previewTitle}>Live Profile Card Preview</div>
        <div className={styles.previewCardWrapper}>
          <canvas ref={previewCanvasRef} className={styles.previewCanvas} />
          <div className={styles.previewGradient} />
          <div className={styles.previewBadge}>
            <div className={styles.previewBadgeName}>ASIRI INDRAJITH</div>
            <div className={styles.previewBadgeSubtitle}>UNDERGRADUATE • UOM</div>
          </div>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '280px', lineHeight: '1.5' }}>
          This is exactly how your profile photo will appear on the public hero section.
        </div>
      </div>

      {/* Actions */}
      <div className={styles.editorActions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={isUploading}>
          Cancel
        </button>
        <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={isUploading}>
          {isUploading ? "Saving Photo..." : "Save Profile Photo"}
        </button>
      </div>
    </div>
  );
}
