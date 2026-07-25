import React from "react";
import { DiplomaticProposalType } from "@/domain/diplomacy/diplomacy.schema";

interface DiplomacyControlPanelProps {
  targetCountryName: string;
  onPropose: (type: DiplomaticProposalType) => void;
  onDeclareWar: () => void;
}

export function DiplomacyControlPanel({
  targetCountryName,
  onPropose,
  onDeclareWar,
}: DiplomacyControlPanelProps) {
  return (
    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 space-y-2">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
        Diplomatic Bureau for {targetCountryName}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onPropose("NON_AGGRESSION_PACT")}
          className="py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] text-slate-300 font-bold rounded-lg transition-colors font-mono"
        >
          Propose Pact
        </button>
        <button
          onClick={() => onPropose("FULL_ALLIANCE")}
          className="py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] text-slate-300 font-bold rounded-lg transition-colors font-mono"
        >
          Alliance
        </button>
        <button
          onClick={() => onPropose("PEACE_TREATY")}
          className="py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] text-slate-300 font-bold rounded-lg transition-colors font-mono"
        >
          Peace Offer
        </button>
        <button
          onClick={onDeclareWar}
          className="py-2 bg-rose-950/20 border border-rose-900/40 hover:bg-rose-900/30 text-[10px] text-rose-400 font-bold rounded-lg transition-colors font-mono"
        >
          Declare War
        </button>
      </div>
    </div>
  );
}
