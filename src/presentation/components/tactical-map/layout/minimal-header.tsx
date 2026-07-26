import React from "react";

interface MinimalHeaderProps {
  currentTurn: number;
  onResetSession: () => void;
  onAdvanceTurn: () => void;
  isAdvancing: boolean;
}

export function MinimalHeader({
  currentTurn,
  onResetSession,
  onAdvanceTurn,
  isAdvancing,
}: MinimalHeaderProps) {
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-40 pointer-events-none">
      <div className="bg-slate-950/90 border border-slate-900 px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-xl pointer-events-auto">
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-xs font-mono font-bold text-slate-400">
          TURN <span className="text-white">{currentTurn}</span>
        </span>
      </div>

      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          onClick={onResetSession}
          className="px-4 py-2.5 bg-slate-950/90 border border-slate-900 rounded-2xl text-[10px] font-mono font-bold text-slate-400 hover:text-rose-400 transition-colors shadow-xl"
        >
          RESET
        </button>
        <button
          onClick={onAdvanceTurn}
          disabled={isAdvancing}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-[10px] font-mono font-bold rounded-2xl transition-all shadow-xl shadow-emerald-950/20 border border-emerald-500/20"
        >
          {isAdvancing ? "RESOLVING..." : "END TURN"}
        </button>
      </div>
    </div>
  );
}
