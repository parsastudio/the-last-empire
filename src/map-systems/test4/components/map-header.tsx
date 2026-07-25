import React from "react";

interface MapHeaderProps {
  phase: 1 | 2 | 3;
  setPhase: (phase: 1 | 2 | 3) => void;
  onResetView: () => void;
}

export const MapHeader: React.FC<MapHeaderProps> = ({
  phase,
  setPhase,
  onResetView,
}) => {
  return (
    <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10">
      <div>
        <h1 className="text-sm font-bold uppercase tracking-wider">
          Advanced Geopolitical Atlas Engine - Stage 4
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Use mouse wheel to zoom dynamically centered on cursor. Phase 3 splits
          the world into ~10,000 equal-sized smooth sectors.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onResetView}
          className="px-3 py-2 rounded-lg text-xs font-mono border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white transition-all"
        >
          Reset View
        </button>
        <button
          onClick={() => setPhase(1)}
          className={`px-4 py-2 rounded-lg text-xs font-mono border transition-all ${
            phase === 1
              ? "bg-emerald-600 border-emerald-500 text-white"
              : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
          }`}
        >
          Phase 1: Complete Countries
        </button>
        <button
          onClick={() => setPhase(2)}
          className={`px-4 py-2 rounded-lg text-xs font-mono border transition-all ${
            phase === 2
              ? "bg-rose-600 border-rose-500 text-white"
              : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
          }`}
        >
          Phase 2: Island Areas
        </button>
        <button
          onClick={() => setPhase(3)}
          className={`px-4 py-2 rounded-lg text-xs font-mono border transition-all ${
            phase === 3
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
          }`}
        >
          Phase 3: Global 10K Regions
        </button>
      </div>
    </div>
  );
};
