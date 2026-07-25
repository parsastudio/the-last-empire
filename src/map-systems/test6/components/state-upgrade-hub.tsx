import React from "react";

interface StateUpgradeHubProps {
  infraLevel: number;
  industrialLevel: number;
  onUpgradeInfra: () => void;
  onUpgradeIndustrial: () => void;
}

export function StateUpgradeHub({
  infraLevel,
  industrialLevel,
  onUpgradeInfra,
  onUpgradeIndustrial,
}: StateUpgradeHubProps) {
  return (
    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 space-y-3">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
        State Infrastructure Core
      </h3>
      <div className="grid grid-cols-2 gap-2 text-center">
        <button
          onClick={onUpgradeInfra}
          className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-colors space-y-1"
        >
          <div className="text-[10px] font-mono text-slate-500">
            Logistics Grid
          </div>
          <div className="text-xs font-bold text-white font-mono">
            Level {infraLevel}
          </div>
        </button>
        <button
          onClick={onUpgradeIndustrial}
          className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-colors space-y-1"
        >
          <div className="text-[10px] font-mono text-slate-500">
            Industrial Output
          </div>
          <div className="text-xs font-bold text-white font-mono">
            Level {industrialLevel}
          </div>
        </button>
      </div>
    </div>
  );
}
