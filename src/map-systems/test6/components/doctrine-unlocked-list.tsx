import React from "react";
import { DoctrinesState } from "@/domain/politics/doctrines.schema";

interface DoctrineUnlockedListProps {
  doctrines: DoctrinesState;
  onUnlock: (doctrineId: string) => void;
}

export function DoctrineUnlockedList({
  doctrines,
  onUnlock,
}: DoctrineUnlockedListProps) {
  return (
    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 space-y-3">
      <div className="flex justify-between items-center border-b border-slate-850 pb-2">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
          Doctrines & Points
        </h3>
        <span className="text-xs font-bold text-emerald-400 font-mono">
          {doctrines.doctrinePoints.toFixed(2)} pts
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <button
          onClick={() => onUnlock("gdp-booster")}
          disabled={doctrines.unlockedDoctrines.includes("gdp-booster")}
          className="py-2.5 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:bg-emerald-950/20 disabled:border-emerald-800/20 disabled:text-emerald-400 rounded-xl text-[10px] font-semibold transition-colors font-mono"
        >
          {doctrines.unlockedDoctrines.includes("gdp-booster")
            ? "GDP Booster Unlocked"
            : "Automation Booster"}
        </button>
        <button
          onClick={() => onUnlock("low-upkeep")}
          disabled={doctrines.unlockedDoctrines.includes("low-upkeep")}
          className="py-2.5 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:bg-emerald-950/20 disabled:border-emerald-800/20 disabled:text-emerald-400 rounded-xl text-[10px] font-semibold transition-colors font-mono"
        >
          {doctrines.unlockedDoctrines.includes("low-upkeep")
            ? "Upkeep Discount Unlocked"
            : "Upkeep Discount"}
        </button>
      </div>
    </div>
  );
}
