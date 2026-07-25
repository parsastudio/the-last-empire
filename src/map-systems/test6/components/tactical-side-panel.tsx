import React from "react";
import { GameState } from "@/domain/game/game-state.schema";

interface TacticalSidePanelProps {
  state: GameState;
  humanNationId: string;
}

export function TacticalSidePanel({
  state,
  humanNationId,
}: TacticalSidePanelProps) {
  const nation = state.nations[humanNationId];
  if (!nation) {
    return null;
  }

  return (
    <div className="w-80 bg-slate-900/90 backdrop-blur-md border-r border-slate-800 p-5 flex flex-col h-full space-y-6 overflow-y-auto">
      <div className="space-y-1 border-b border-slate-800 pb-4">
        <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
          Sovereign Dashboard
        </span>
        <h2 className="text-lg font-bold text-white tracking-tight">
          {nation.name}
        </h2>
      </div>
      <div className="space-y-4">
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Stability</span>
            <span className="text-emerald-400 font-bold">
              {nation.government.stability}%
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Total GDP</span>
            <span className="text-white font-bold">
              ${(nation.gdp / 1e9).toFixed(1)}B
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Treasury</span>
            <span className="text-white font-bold">
              ${(nation.treasury / 1000).toFixed(0)}k
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Population</span>
            <span className="text-white font-bold">
              ${(nation.population / 1e6).toFixed(1)}M
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Military Stacks
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
              <div className="text-[10px] text-slate-500">INF</div>
              <div className="text-sm font-bold text-white mt-1">
                {nation.military.infantry}
              </div>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
              <div className="text-[10px] text-slate-500">AIR</div>
              <div className="text-sm font-bold text-white mt-1">
                {nation.military.airForce}
              </div>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
              <div className="text-[10px] text-slate-500">DRN</div>
              <div className="text-sm font-bold text-white mt-1">
                {nation.military.droneMissile}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
