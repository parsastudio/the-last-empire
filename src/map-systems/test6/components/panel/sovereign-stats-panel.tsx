import React from "react";
import { Nation } from "@/domain/nation/nation.schema";

interface SovereignStatsPanelProps {
  nation: Nation;
}

export function SovereignStatsPanel({ nation }: SovereignStatsPanelProps) {
  return (
    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 space-y-3 font-mono">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400">Domestic Stability</span>
        <span className="text-emerald-400 font-bold">
          {nation.government.stability}%
        </span>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400">Total GDP Output</span>
        <span className="text-white font-bold">
          ${(nation.gdp / 1e9).toFixed(1)}B
        </span>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400">Sovereign Treasury</span>
        <span className="text-white font-bold">
          ${(nation.treasury / 1000).toFixed(0)}k
        </span>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400">Active Population</span>
        <span className="text-white font-bold">
          ${(nation.population / 1e6).toFixed(1)}M
        </span>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400">National Debt</span>
        <span className="text-rose-400 font-bold">
          ${(nation.nationalDebt / 1000).toFixed(0)}k
        </span>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400">Available Manpower</span>
        <span className="text-emerald-400 font-bold">
          {nation.resources.manpower}
        </span>
      </div>
    </div>
  );
}
