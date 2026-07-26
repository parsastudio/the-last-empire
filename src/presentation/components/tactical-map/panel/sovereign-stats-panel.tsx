import React from "react";
import { Nation } from "@/domain/nation/nation.schema";

interface SovereignStatsPanelProps {
  nation: Nation;
}

export function SovereignStatsPanel({ nation }: SovereignStatsPanelProps) {
  return (
    <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-950 space-y-4 font-mono">
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Stability</span>
          <span className="text-emerald-400 font-bold">
            {nation.government.stability}%
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">GDP Output</span>
          <span className="text-white font-bold">
            ${(nation.gdp / 1e9).toFixed(1)}B
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Treasury</span>
          <span className="text-white font-bold">
            ${(nation.treasury / 1000).toFixed(0)}k
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Population</span>
          <span className="text-white font-bold">
            ${(nation.population / 1e6).toFixed(1)}M
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">National Debt</span>
          <span className="text-rose-450 font-bold">
            ${(nation.nationalDebt / 1000).toFixed(0)}k
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Manpower</span>
          <span className="text-emerald-400 font-bold">
            {nation.resources.manpower}
          </span>
        </div>
      </div>

      {nation.traits.length > 0 && (
        <div className="border-t border-slate-900 pt-3.5 space-y-2">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
            National Traits
          </span>
          <div className="flex flex-wrap gap-1.5">
            {nation.traits.map((trait) => (
              <span
                key={trait}
                className="px-2 py-0.5 bg-slate-900/50 border border-slate-850 rounded-lg text-[9px] text-slate-450 uppercase tracking-wider"
              >
                {trait.replace("_", " ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
