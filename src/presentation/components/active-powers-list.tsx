"use client";

import React, { useMemo } from "react";

export interface ActivePowerNation {
  id: string;
  name: string;
  gdp: number;
  population: number;
  provinceCount: number;
}

interface ActivePowersListProps {
  survivingNations: ActivePowerNation[];
  hoveredNationId: string | null;
  selectedNationId: string | null;
  onSelectNation: (id: string) => void;
  onHoverNation: (id: string | null) => void;
}

export function ActivePowersList({
  survivingNations,
  hoveredNationId,
  selectedNationId,
  onSelectNation,
  onHoverNation,
}: ActivePowersListProps) {
  const sortedPowers = useMemo(() => {
    return [...survivingNations].sort(
      (a, b) => b.provinceCount - a.provinceCount,
    );
  }, [survivingNations]);

  return (
    <div className="w-full h-full flex flex-col bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-2xl">
      <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
        Active Global Powers
      </h3>
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[420px] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {sortedPowers.map((power) => {
          const isSelected = selectedNationId === power.id;
          const isHovered = hoveredNationId === power.id;

          return (
            <div
              key={power.id}
              onClick={() => onSelectNation(power.id)}
              onMouseEnter={() => onHoverNation(power.id)}
              onMouseLeave={() => onHoverNation(null)}
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
        })}
      </div>
    </div>
  );
}
