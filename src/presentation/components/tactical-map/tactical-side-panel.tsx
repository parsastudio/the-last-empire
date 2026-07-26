import React from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { SovereignGdpBox } from "./sovereign-gdp-box";
import { MilitaryStacksBox } from "./military-stacks-box";

interface TacticalSidePanelProps {
  state: GameState;
  humanNationId: string;
  children?: React.ReactNode;
}

export function TacticalSidePanel({
  state,
  humanNationId,
  children,
}: TacticalSidePanelProps) {
  const nation = state.nations[humanNationId];
  if (!nation) {
    return null;
  }

  return (
    <div className="w-80 bg-slate-900/90 backdrop-blur-md border-r border-slate-800 p-5 flex flex-col h-full space-y-5 overflow-y-auto">
      <div className="space-y-1 border-b border-slate-800 pb-4">
        <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase font-mono">
          Sovereign Dashboard
        </span>
        <h2 className="text-base font-bold text-white tracking-tight">
          {nation.name}
        </h2>
      </div>
      <div className="space-y-4 flex-1">
        <SovereignGdpBox nation={nation} />
        <MilitaryStacksBox military={nation.military} />
        {children}
      </div>
    </div>
  );
}
