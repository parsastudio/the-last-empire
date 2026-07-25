import React from "react";
import { ResetSessionButton } from "./reset-session-button";
import { NextTurnButton } from "./next-turn-button";

interface TacticalActionBarProps {
  playerNationId: string | null;
  showHeatmap: boolean;
  isAdvancing: boolean;
  onResetSession: () => void;
  onToggleHeatmap: () => void;
  onAdvanceTurn: () => void;
}

export function TacticalActionBar({
  playerNationId,
  showHeatmap,
  isAdvancing,
  onResetSession,
  onToggleHeatmap,
  onAdvanceTurn,
}: TacticalActionBarProps) {
  return (
    <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
      <ResetSessionButton onReset={onResetSession} />
      <button
        onClick={onToggleHeatmap}
        className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold hover:bg-slate-800 transition-colors"
      >
        {showHeatmap ? "DISABLE TACTICAL HEATMAP" : "ENABLE TACTICAL HEATMAP"}
      </button>
      {playerNationId && (
        <NextTurnButton onAdvance={onAdvanceTurn} isAdvancing={isAdvancing} />
      )}
    </div>
  );
}
