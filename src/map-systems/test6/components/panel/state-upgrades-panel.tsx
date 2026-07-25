import React from "react";

interface StateUpgradesPanelProps {
  infraLevel: number;
  industrialLevel: number;
  currentTaxRate: number;
  onTaxChange: (rate: number) => void;
  onUpgradeInfra: () => void;
  onUpgradeIndustrial: () => void;
}

export function StateUpgradesPanel({
  infraLevel,
  industrialLevel,
  currentTaxRate,
  onTaxChange,
  onUpgradeInfra,
  onUpgradeIndustrial,
}: StateUpgradesPanelProps) {
  return (
    <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-950 space-y-3.5">
      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
        Development Core
      </h3>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-slate-500">Tax Assessment</span>
          <span className="text-white font-bold">{currentTaxRate}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={currentTaxRate}
          onChange={(e) => onTaxChange(Number(e.target.value))}
          className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={onUpgradeInfra}
          className="p-2.5 bg-slate-900/40 border border-slate-850 hover:bg-slate-800 rounded-xl transition-all font-mono text-center"
        >
          <span className="text-[9px] text-slate-600 block">
            Logistics Grid
          </span>
          <span className="text-xs font-bold text-white block mt-0.5">
            Lvl {infraLevel}
          </span>
        </button>
        <button
          onClick={onUpgradeIndustrial}
          className="p-2.5 bg-slate-900/40 border border-slate-850 hover:bg-slate-800 rounded-xl transition-all font-mono text-center"
        >
          <span className="text-[9px] text-slate-600 block">
            Industrial Output
          </span>
          <span className="text-xs font-bold text-white block mt-0.5">
            Lvl {industrialLevel}
          </span>
        </button>
      </div>
    </div>
  );
}
