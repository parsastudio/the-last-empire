import React from "react";
import { DoctrinesState } from "@/domain/politics/doctrines.schema";

interface UnlockedDoctrinesPanelProps {
  doctrines: DoctrinesState;
  onUnlock: (id: string) => void;
}

export function UnlockedDoctrinesPanel({
  doctrines,
  onUnlock,
}: UnlockedDoctrinesPanelProps) {
  return (
    <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-950 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
          State Doctrines
        </h3>
        <span className="text-xs font-bold text-emerald-400 font-mono">
          {doctrines.doctrinePoints.toFixed(2)} pts
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => onUnlock("gdp-booster")}
          disabled={doctrines.unlockedDoctrines.includes("gdp-booster")}
          className="py-2.5 px-2 bg-slate-900/40 border border-slate-850 hover:bg-slate-800 disabled:bg-emerald-950/10 disabled:border-emerald-900/20 disabled:text-emerald-400/90 rounded-xl text-[10px] font-semibold transition-all font-mono"
        >
          {doctrines.unlockedDoctrines.includes("gdp-booster")
            ? "Automation Act"
            : "Automation"}
        </button>
        <button
          onClick={() => onUnlock("low-upkeep")}
          disabled={doctrines.unlockedDoctrines.includes("low-upkeep")}
          className="py-2.5 px-2 bg-slate-900/40 border border-slate-850 hover:bg-slate-800 disabled:bg-emerald-950/10 disabled:border-emerald-900/20 disabled:text-emerald-400/90 rounded-xl text-[10px] font-semibold transition-all font-mono"
        >
          {doctrines.unlockedDoctrines.includes("low-upkeep")
            ? "Logistics Act"
            : "Logistics"}
        </button>
      </div>
    </div>
  );
}
