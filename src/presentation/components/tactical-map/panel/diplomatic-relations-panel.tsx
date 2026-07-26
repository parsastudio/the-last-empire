import React from "react";
import {
  RelationProfile,
  DiplomaticProposalType,
} from "@/domain/diplomacy/diplomacy.schema";

interface DiplomaticRelationsPanelProps {
  targetCountryName: string;
  relations: Record<string, RelationProfile>;
  onPropose: (type: DiplomaticProposalType) => void;
  onDeclareWar: () => void;
}

export function DiplomaticRelationsPanel({
  relations,
  onPropose,
  onDeclareWar,
}: DiplomaticRelationsPanelProps) {
  const activeAlliances = Object.values(relations).filter(
    (r) => r.stance === "ALLIANCE" || r.stance === "NON_AGGRESSION_PACT",
  );

  const activeConflicts = Object.values(relations).filter(
    (r) => r.stance === "WAR",
  );

  return (
    <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-950 space-y-4">
      <div className="space-y-3.5">
        <div className="space-y-2">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono block">
            Active Treaties
          </span>
          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
            {activeAlliances.length === 0 ? (
              <div className="text-[10px] text-slate-650 italic font-mono">
                No active alliances.
              </div>
            ) : (
              activeAlliances.map((treaty) => (
                <div
                  key={treaty.targetNationId}
                  className="flex justify-between items-center p-2 bg-slate-900/20 border border-slate-850 rounded-xl text-[10px] font-mono"
                >
                  <span className="text-slate-400 font-bold">
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

        <div className="space-y-2">
          <span className="text-[9px] font-bold text-rose-500/70 uppercase tracking-wider font-mono block">
            Active Conflicts
          </span>
          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
            {activeConflicts.length === 0 ? (
              <div className="text-[10px] text-slate-650 italic font-mono">
                No active conflicts.
              </div>
            ) : (
              activeConflicts.map((war) => (
                <div
                  key={war.targetNationId}
                  className="flex justify-between items-center p-2 bg-rose-950/10 border border-rose-900/20 rounded-xl text-[10px] font-mono"
                >
                  <span className="text-rose-350 font-bold">
                    {war.targetNationId}
                  </span>
                  <span className="text-rose-500 font-bold uppercase text-[8px] bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                    WAR
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-slate-950 pt-3.5">
        <button
          onClick={() => onPropose("NON_AGGRESSION_PACT")}
          className="py-2 bg-slate-900/40 border border-slate-850 hover:bg-slate-800 text-[9px] text-slate-300 font-bold rounded-lg transition-all font-mono"
        >
          Propose Pact
        </button>
        <button
          onClick={() => onPropose("FULL_ALLIANCE")}
          className="py-2 bg-slate-900/40 border border-slate-850 hover:bg-slate-800 text-[9px] text-slate-300 font-bold rounded-lg transition-all font-mono"
        >
          Alliance
        </button>
        <button
          onClick={() => onPropose("PEACE_TREATY")}
          className="py-2 bg-slate-900/40 border border-slate-850 hover:bg-slate-800 text-[9px] text-slate-300 font-bold rounded-lg transition-all font-mono"
        >
          Peace Offer
        </button>
        <button
          onClick={onDeclareWar}
          className="py-2 bg-rose-950/10 border border-rose-900/30 hover:bg-rose-900/20 text-[9px] text-rose-450 font-bold rounded-lg transition-all font-mono"
        >
          Declare War
        </button>
      </div>
    </div>
  );
}
