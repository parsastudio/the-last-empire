import React from "react";
import { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";

interface AllianceMatrixWidgetProps {
  relations: Record<string, RelationProfile>;
}

export function AllianceMatrixWidget({ relations }: AllianceMatrixWidgetProps) {
  const activeTreaties = Object.values(relations).filter(
    (r) => r.stance === "ALLIANCE" || r.stance === "NON_AGGRESSION_PACT",
  );

  return (
    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 space-y-2">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
        Active Pacts & Treaties
      </h3>
      <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
        {activeTreaties.length === 0 ? (
          <div className="text-[11px] text-slate-500 italic">
            No active diplomatic pacts.
          </div>
        ) : (
          activeTreaties.map((treaty) => (
            <div
              key={treaty.targetNationId}
              className="flex justify-between items-center p-2 bg-slate-900/40 border border-slate-800/50 rounded-lg text-[10px] font-mono"
            >
              <span className="text-slate-300 font-bold">
                {treaty.targetNationId}
              </span>
              <span className="text-emerald-400 font-bold uppercase text-[8px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                {treaty.stance.replace("_", " ")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
