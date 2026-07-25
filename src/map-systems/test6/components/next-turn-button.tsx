import React from "react";

interface NextTurnButtonProps {
  onAdvance: () => void;
  isAdvancing: boolean;
}

export function NextTurnButton({
  onAdvance,
  isAdvancing,
}: NextTurnButtonProps) {
  return (
    <button
      onClick={onAdvance}
      disabled={isAdvancing}
      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-mono font-bold rounded-xl transition-colors shadow-lg border border-emerald-500/30"
    >
      {isAdvancing ? "PROCESSING TURN..." : "END TURN"}
    </button>
  );
}
