import React from "react";
import type { ActivePowerNation } from "@/presentation/components/active-powers-list";

interface ActivePowerItemProps {
  power: ActivePowerNation;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

export function ActivePowerItem({
  power,
  isSelected,
  isHovered,
  onSelect,
  onHoverStart,
  onHoverEnd,
}: ActivePowerItemProps) {
  return (
    <div
      onClick={onSelect}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
        isSelected
          ? "bg-emerald-600/20 border border-emerald-500/50 text-white"
          : isHovered
            ? "bg-slate-800 border border-slate-700 text-slate-100"
            : "bg-slate-900/40 border border-transparent text-slate-400 hover:bg-slate-800/40"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-3.5 h-3.5 rounded-full"
          style={{
            backgroundColor: isSelected
              ? "rgb(16, 185, 129)"
              : "rgb(100, 116, 139)",
          }}
        />
        <div>
          <div className="text-sm font-semibold">{power.name}</div>
          <div className="text-xs text-slate-500 font-mono">
            GDP: ${(power.gdp / 1e12).toFixed(2)}T
          </div>
        </div>
      </div>
      <div className="text-right">
        <span className="text-xs font-semibold px-2 py-1 bg-slate-950/50 rounded-lg text-emerald-400 font-mono">
          {power.provinceCount} regions
        </span>
      </div>
    </div>
  );
}
