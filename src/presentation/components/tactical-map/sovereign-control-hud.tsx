import React from "react";
import { Nation } from "@/domain/nation/nation.schema";

interface SovereignControlHudProps {
  nation: Nation;
}

export function SovereignControlHud({ nation }: SovereignControlHudProps) {
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-6 z-40">
      <div className="flex items-center gap-6">
        <div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
            National Debt
          </div>
          <div className="text-sm font-bold text-rose-400 font-mono">
            ${(nation.nationalDebt / 1000).toFixed(0)}k
          </div>
        </div>
        <div className="h-8 w-px bg-slate-800" />
        <div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
            Tax Rate
          </div>
          <div className="text-sm font-bold text-white font-mono">
            {nation.taxRate}%
          </div>
        </div>
        <div className="h-8 w-px bg-slate-800" />
        <div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
            Manpower
          </div>
          <div className="text-sm font-bold text-emerald-400 font-mono">
            {nation.resources.manpower}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {nation.traits.map((trait) => (
          <span
            key={trait}
            className="px-2.5 py-1 bg-slate-950/60 border border-slate-850 rounded-lg text-[10px] font-mono text-slate-400 uppercase tracking-wider"
          >
            {trait.replace("_", " ")}
          </span>
        ))}
      </div>
    </div>
  );
}
