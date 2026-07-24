import React from "react";
import type { Province } from "@/domain/map/province.schema";

interface ConquestsListCardProps {
  conquests: (Province & { occupiedPercent: number })[];
}

export function ConquestsListCard({ conquests }: ConquestsListCardProps) {
  return (
    <div>
      <h2 className="text-xs font-bold text-slate-400 mb-2">
        Invasion Conquests
      </h2>
      <div className="max-h-[150px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {conquests.length === 0 ? (
          <p className="text-[10px] text-slate-500 font-mono italic">
            No conquests.
          </p>
        ) : (
          conquests.map((p) => (
            <div
              key={p.id}
              className="p-2.5 bg-slate-950/50 border border-slate-800/50 rounded-lg text-[10px] font-mono space-y-0.5 text-slate-300"
            >
              <div className="flex justify-between">
                <span className="text-white font-bold">{p.name}</span>
                <span className="text-emerald-400 font-extrabold">
                  {p.occupiedPercent}%
                </span>
              </div>
              <div className="text-slate-500 text-[8px]">
                GDP Contribution: $
                {((p.gdp * (p.occupiedPercent / 100)) / 1e9).toFixed(1)}B | Pop:
                ${((p.population * (p.occupiedPercent / 100)) / 1e6).toFixed(1)}
                M
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
