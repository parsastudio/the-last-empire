import React from "react";

interface TestPageHeaderProps {
  regionCount: number;
}

export function TestPageHeader({ regionCount }: TestPageHeaderProps) {
  return (
    <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center z-10">
      <div>
        <h1 className="text-sm font-bold uppercase tracking-wider">
          Precision Global Grid Subdivision Engine
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Continuous bisection grid logic with perfect border snapping.
        </p>
      </div>
      <div className="text-right">
        <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-emerald-400">
          {regionCount} Active Regions Generated
        </span>
      </div>
    </div>
  );
}
