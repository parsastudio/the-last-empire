import React from "react";
import { GameState } from "@/domain/game/game-state.schema";

interface CountryStatusIndicatorProps {
  state: GameState;
  humanNationId: string;
}

export function CountryStatusIndicator({
  state,
  humanNationId,
}: CountryStatusIndicatorProps) {
  const nation = state.nations[humanNationId];
  if (!nation) {
    return null;
  }

  return (
    <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3 z-40">
      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
      <div className="text-xs font-mono">
        <span className="text-slate-400">TURN</span>{" "}
        <span className="text-white font-bold">{state.currentTurn}</span>
      </div>
    </div>
  );
}
