"use client";

import React, { useMemo } from "react";
import { ActivePowerItem } from "./active-powers/active-power-item";

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
        {sortedPowers.map((power) => (
          <ActivePowerItem
            key={power.id}
            power={power}
            isSelected={selectedNationId === power.id}
            isHovered={hoveredNationId === power.id}
            onSelect={() => onSelectNation(power.id)}
            onHoverStart={() => onHoverNation(power.id)}
            onHoverEnd={() => onHoverNation(null)}
          />
        ))}
      </div>
    </div>
  );
}
