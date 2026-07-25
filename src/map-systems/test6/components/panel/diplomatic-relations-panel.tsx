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
  const activeTreaties = Object.values(relations).filter(
    (r) => r.stance === "ALLIANCE" || r.stance === "NON_AGGRESSION_PACT",
  );

  return (
    <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-950 space-y-3.5">
      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
        Sovereign Pacts & Alliances
      </h3>
      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
        {activeTreaties.length === 0 ? (
          <div className="text-[10px] text-slate-650 italic font-mono">
            No international treaties established.
          </div>
        ) : (
          activeTreaties.map((treaty) => (
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
      <div className="grid grid-cols-2 gap-2 border-t border-slate-950 pt-3">
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
