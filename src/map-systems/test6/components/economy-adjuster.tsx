import React from "react";

interface EconomyAdjusterProps {
  currentTaxRate: number;
  onTaxChange: (newRate: number) => void;
}

export function EconomyAdjuster({
  currentTaxRate,
  onTaxChange,
}: EconomyAdjusterProps) {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTaxChange(Number(e.target.value));
  };

  return (
    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 space-y-2">
      <div className="flex justify-between items-center text-xs font-mono">
        <span className="text-slate-400">Fiscal Tax Rate</span>
        <span className="text-white font-bold">{currentTaxRate}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={currentTaxRate}
        onChange={handleSliderChange}
        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
      />
    </div>
  );
}
