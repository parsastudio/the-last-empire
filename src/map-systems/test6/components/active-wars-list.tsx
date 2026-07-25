import React from "react";
import { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";

interface ActiveWarsListProps {
  relations: Record<string, RelationProfile>;
}

export function ActiveWarsList({ relations }: ActiveWarsListProps) {
  const activeWars = Object.values(relations).filter((r) => r.stance === "WAR");

  return (
    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 space-y-2">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
        Active Theater Conflicts
      </h3>
      <div className="space-y-1.5 max-h-24 overflow-y-auto">
        {activeWars.length === 0 ? (
          <div className="text-[11px] text-slate-500 italic">
            No active conflicts.
          </div>
        ) : (
          activeWars.map((war) => (
            <div
              key={war.targetNationId}
              className="flex justify-between items-center p-2 bg-rose-950/20 border border-rose-900/30 rounded-lg text-[10px] font-mono"
            >
              <span className="text-rose-300 font-bold">
                {war.targetNationId}
              </span>
              <span className="text-rose-500 font-bold uppercase text-[9px] bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                WAR
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
