import React from "react";

interface TestPageHeaderProps {
  regionCount: number;
  areaThreshold: number;
  onThresholdChange: (val: number) => void;
}

export function TestPageHeader({
  regionCount,
  areaThreshold,
  onThresholdChange,
}: TestPageHeaderProps) {
  return (
    <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10">
      <div>
        <h1 className="text-sm font-bold uppercase tracking-wider">
          Precision Global Grid Subdivision Engine
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Continuous bisection grid logic with perfect border snapping.
        </p>
      </div>
      <div className="flex items-center gap-6 w-full md:w-auto">
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
          <span className="text-slate-500">Area Filter:</span>
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={areaThreshold}
            onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
            className="w-32 accent-emerald-500 cursor-pointer"
          />
          <span className="text-emerald-400 min-w-[50px] text-right">
            &lt; {areaThreshold.toFixed(2)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-emerald-400 whitespace-nowrap">
            {regionCount} Active Regions Generated
          </span>
        </div>
      </div>
    </div>
  );
}
