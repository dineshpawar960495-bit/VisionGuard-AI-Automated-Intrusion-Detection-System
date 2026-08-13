import React, { useState, useRef, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';

const CANVAS_W = 1280;
const CANVAS_H = 720;
const DEFAULT = [[80, 60], [400, 60], [420, 220], [60, 220]];

export default function ZoneEditor({ currentCoords = null, onSave }) {
  const containerRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [containerSize, setContainerSize] = useState({ width: 360, height: 200 });

  // Initialize points from currentCoords or default
  useEffect(() => {
    let initial;
    if (currentCoords && currentCoords.length) {
      initial = currentCoords.map(coord => {
        if (Array.isArray(coord)) {
          return { x: coord[0], y: coord[1] };
        } else {
          return { x: coord.x, y: coord.y };
        }
      });
    } else {
      initial = DEFAULT.map(([x, y]) => ({ x, y }));
    }
    setPoints(initial);
  }, [currentCoords]);

  // Measure container size
  useEffect(() => {
    const measureContainer = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    measureContainer();
    window.addEventListener('resize', measureContainer);
    return () => window.removeEventListener('resize', measureContainer);
  }, []);

  // Convert logical coords to display coords
  const toDisplayCoords = (point) => ({
    x: (point.x / CANVAS_W) * containerSize.width,
    y: (point.y / CANVAS_H) * containerSize.height
  });

  // Convert display coords to logical coords
  const toLogicalCoords = (displayPoint) => ({
    x: Math.round((displayPoint.x / containerSize.width) * CANVAS_W),
    y: Math.round((displayPoint.y / containerSize.height) * CANVAS_H)
  });

  const handleMouseDown = (index, e) => {
    setDraggingIndex(index);
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = (e) => {
    if (draggingIndex === null || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Clamp to container bounds
    const clampedX = Math.max(0, Math.min(containerSize.width, x));
    const clampedY = Math.max(0, Math.min(containerSize.height, y));

    const newPoints = [...points];
    newPoints[draggingIndex] = toLogicalCoords({ x: clampedX, y: clampedY });
    setPoints(newPoints);
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
  };

  const saveConfiguration = async () => {
    try {
      const backendCoords = points.map(p => [p.x, p.y]);
      const response = await fetch('http://localhost:8000/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coords: backendCoords })
      });
      
      if (response.ok) {
        onSave(points);
        console.log('Zone saved successfully:', backendCoords);
      } else {
        console.error('Failed to save zone');
      }
    } catch (error) {
      console.error('Error saving zone:', error);
    }
  };

  const reset = () => {
    const defaultPoints = DEFAULT.map(([x, y]) => ({ x, y }));
    setPoints(defaultPoints);
  };

  const displayPoints = points.map(p => toDisplayCoords(p));
  const polygonPoints = displayPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 p-4 rounded-2xl shadow-2xl shadow-cyan-500/10">
      <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-bold mb-3 flex items-center gap-2">
        <RefreshCw size={16} className="text-cyan-400" /> ZONE GEOMETRY CONFIG
      </h3>
      
      <div 
        ref={containerRef}
        className="relative w-full h-[200px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 select-none shadow-inner"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}>
          <defs>
            <linearGradient id="zoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgba(34, 197, 94, 0.2)', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'rgba(6, 182, 212, 0.2)', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <polygon 
            points={polygonPoints} 
            fill="url(#zoneGradient)" 
            stroke="url(#zoneGradient)" 
            strokeWidth="3"
            style={{ filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.3))' }}
          />
          {displayPoints.map((p, i) => (
            <circle 
              key={i}
              cx={p.x}
              cy={p.y}
              r={10}
              fill="#fff"
              stroke="#059669"
              strokeWidth={3}
              style={{ cursor: 'grab', filter: 'drop-shadow(0 0 6px rgba(5, 150, 105, 0.5))' }}
              onMouseDown={(e) => handleMouseDown(i, e)}
            />
          ))}
        </svg>

        {/* Draggable handles overlay */}
        {displayPoints.map((p, i) => (
          <div
            key={`handle-${i}`}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: 32,
              height: 32,
              marginLeft: -16,
              marginTop: -16,
              cursor: draggingIndex === i ? 'grabbing' : 'grab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
            onMouseDown={(e) => handleMouseDown(i, e)}
          >
            <div 
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #16a34a, #059669)',
                borderWidth: 3,
                borderColor: '#fff',
                borderStyle: 'solid',
                boxShadow: '0 0 15px rgba(34, 197, 94, 0.6), 0 0 30px rgba(34, 197, 94, 0.3)'
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-3">
        <div className="text-[10px] text-slate-500 font-mono bg-slate-950/50 px-3 py-1 rounded-lg border border-slate-800">
          Coords: {points.map(p => `(${p.x},${p.y})`).join(' ')}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={reset}
            className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-slate-300 px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-xs transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <RefreshCw size={14} /> RESET
          </button>
          <button 
            onClick={saveConfiguration}
            className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-xs transition-all hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/30"
          >
            <Save size={14} /> SAVE ZONE
          </button>
        </div>
      </div>
    </div>
  );
}