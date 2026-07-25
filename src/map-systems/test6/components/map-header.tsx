import React from "react";

interface MapHeaderProps {
  isCached: boolean;
  countriesCount: number;
}

export function MapHeader({ isCached, countriesCount }: MapHeaderProps) {
  return (
    <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center gap-4 z-10">
      <div>
        <h1 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
          Pristine 4K Board-Game Map - Test 6
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          1px precise deep navy borders. Continuous 11-tier satin ocean floor
          gradient.
        </p>
      </div>
      <div className="text-right flex items-center gap-4">
        <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-emerald-400">
          Status: {isCached ? "CACHED" : "RE-GENERATED 4K LIVE"}
        </span>
        <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-emerald-400">
          {countriesCount} States Connected
        </span>
      </div>
    </div>
  );
}
