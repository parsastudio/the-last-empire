import React from "react";

interface GlobalSimulationControlProps {
  forceSuccess: boolean;
  onToggleForceSuccess: () => void;
}

export function GlobalSimulationControl({
  forceSuccess,
  onToggleForceSuccess,
}: GlobalSimulationControlProps) {
  return (
    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 space-y-3">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
        Tactical Parameters
      </h3>
      <div className="flex justify-between items-center">
        <span className="text-slate-400 text-xs font-mono">Testing Bypass</span>
        <button
          onClick={onToggleForceSuccess}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono border transition-colors ${
            forceSuccess
              ? "bg-rose-950/20 border-rose-800/40 text-rose-400"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
          }`}
        >
          {forceSuccess ? "BYPASS: ON" : "STANDARD RULES"}
        </button>
      </div>
    </div>
  );
}
