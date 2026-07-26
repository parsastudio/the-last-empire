import React from "react";
import { Nation } from "@/domain/nation/nation.schema";

interface SovereignGdpBoxProps {
  nation: Nation;
}

export function SovereignGdpBox({ nation }: SovereignGdpBoxProps) {
  return (
    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 space-y-3 font-mono">
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
  );
}
