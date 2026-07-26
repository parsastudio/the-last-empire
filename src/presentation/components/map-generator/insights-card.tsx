import React from "react";

interface InsightsCardProps {
  statesCount: number;
  totalArea: number;
}

export function InsightsCard({ statesCount, totalArea }: InsightsCardProps) {
  return (
    <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-3xl space-y-4">
      <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
        Topology Insights
      </h3>
      <div className="grid grid-cols-2 gap-4 font-mono text-xs">
        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-900">
          <span className="text-[10px] text-slate-500 block">
            Sovereign States
          </span>
          <span className="text-base font-bold text-slate-200 block mt-1">
            {statesCount}
          </span>
        </div>
        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-900">
          <span className="text-[10px] text-slate-500 block">Surface Area</span>
          <span className="text-base font-bold text-slate-200 block mt-1">
            {totalArea > 0 ? `${(totalArea / 1e6).toFixed(1)}M km²` : "0"}
          </span>
        </div>
      </div>
    </div>
  );
}
