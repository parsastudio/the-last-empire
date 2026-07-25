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
    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 space-y-3">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
        State & Economy Upgrades
      </h3>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-slate-400">Fiscal Tax Rate</span>
          <span className="text-white font-bold">{currentTaxRate}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={currentTaxRate}
          onChange={(e) => onTaxChange(Number(e.target.value))}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 text-center pt-1.5">
        <button
          onClick={onUpgradeInfra}
          className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-all font-mono"
        >
          <span className="text-[9px] text-slate-500 block">Logistics</span>
          <span className="text-xs font-bold text-white block">
            Lvl {infraLevel}
          </span>
        </button>
        <button
          onClick={onUpgradeIndustrial}
          className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-all font-mono"
        >
          <span className="text-[9px] text-slate-500 block">Industrial</span>
          <span className="text-xs font-bold text-white block">
            Lvl {industrialLevel}
          </span>
        </button>
      </div>
    </div>
  );
}
