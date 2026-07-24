import React from "react";

interface MapControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export function MapControls({
  scale,
  onZoomIn,
  onZoomOut,
  onResetView,
}: MapControlsProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-800/80 flex items-center gap-4 shadow-2xl pointer-events-auto z-50">
      <button
        onClick={onZoomOut}
        className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 flex items-center justify-center font-bold text-lg select-none transition-colors border border-slate-700/50"
      >
        -
      </button>
      <span className="text-xs font-mono font-bold text-slate-400 select-none min-w-[32px] text-center">
        {scale.toFixed(1)}x
      </span>
      <button
        onClick={onZoomIn}
        className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 flex items-center justify-center font-bold text-lg select-none transition-colors border border-slate-700/50"
      >
        +
      </button>
      <div className="w-px h-6 bg-slate-800" />
      <button
        onClick={onResetView}
        className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full font-semibold transition-colors border border-slate-700/50"
      >
        Reset View
      </button>
    </div>
  );
}
