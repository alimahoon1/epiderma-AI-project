import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Detection } from '../types';

interface Props {
  imageSrc: string;
  detections: Detection[];
}

export const BoundingBoxOverlay: React.FC<Props> = ({ imageSrc, detections }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [renderInfo, setRenderInfo] = useState<{
    offsetX: number;
    offsetY: number;
    renderW: number;
    renderH: number;
  } | null>(null);

  // Colors for different types
  const getColor = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('whitehead')) return { border: '#facc15', bg: 'rgba(250,204,21,0.18)' };
    if (l.includes('blackhead')) return { border: '#475569', bg: 'rgba(71,85,105,0.18)' };
    if (l.includes('pustule') || l.includes('papule')) return { border: '#ef4444', bg: 'rgba(239,68,68,0.18)' };
    if (l.includes('cyst')) return { border: '#a855f7', bg: 'rgba(168,85,247,0.18)' };
    return { border: '#38bdf8', bg: 'rgba(56,189,248,0.18)' };
  };

  const computeRenderInfo = useCallback(() => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth || !img.naturalHeight) return;

    const containerW = img.clientWidth;
    const containerH = img.clientHeight;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;

    // object-contain: image is scaled to fit entirely within the container
    const scale = Math.min(containerW / natW, containerH / natH);
    const renderW = natW * scale;
    const renderH = natH * scale;

    // The image is centered within the container, so compute the offset
    const offsetX = (containerW - renderW) / 2;
    const offsetY = (containerH - renderH) / 2;

    setRenderInfo({ offsetX, offsetY, renderW, renderH });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', computeRenderInfo);
    return () => window.removeEventListener('resize', computeRenderInfo);
  }, [computeRenderInfo]);

  const handleImageLoad = () => {
    computeRenderInfo();
  };

  return (
    <div className="relative inline-block rounded-lg overflow-hidden shadow-md group">
      <img
        ref={imgRef}
        src={imageSrc}
        alt="Analyzed Skin"
        className="max-w-full h-auto max-h-[400px] object-contain block"
        onLoad={handleImageLoad}
      />

      {renderInfo && detections.map((det, idx) => {
        // Backend sends [ymin, xmin, ymax, xmax] normalized 0-1000
        const [ymin, xmin, ymax, xmax] = det.bbox;

        // Convert from 0-1000 normalized coords to pixel positions
        // within the actual rendered image area
        const left = renderInfo.offsetX + (xmin / 1000) * renderInfo.renderW;
        const top = renderInfo.offsetY + (ymin / 1000) * renderInfo.renderH;
        const width = ((xmax - xmin) / 1000) * renderInfo.renderW;
        const height = ((ymax - ymin) / 1000) * renderInfo.renderH;

        const colors = getColor(det.label);

        return (
          <div
            key={idx}
            className="absolute transition-opacity duration-300 hover:opacity-100"
            style={{
              top: `${top}px`,
              left: `${left}px`,
              width: `${width}px`,
              height: `${height}px`,
              border: `2px solid ${colors.border}`,
              backgroundColor: colors.bg,
              boxSizing: 'border-box',
              borderRadius: '4px',
            }}
          >
            <span
              className="absolute -top-5 left-0 text-[10px] px-1.5 py-0.5 rounded text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ backgroundColor: 'rgba(20, 19, 19, 0.75)' }}
            >
              {det.label} {(det.confidence * 100).toFixed(0)}%
            </span>
          </div>
        );
      })}
    </div>
  );
};