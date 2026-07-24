import React from "react";

interface NeighborsListCardProps {
  activeBorders: string[];
}

export function NeighborsListCard({ activeBorders }: NeighborsListCardProps) {
  return (
    <div>
      <h2 className="text-xs font-bold text-sky-400 mb-2">
        Active Land Neighbors
      </h2>
      <div className="max-h-[120px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {activeBorders.length === 0 ? (
          <p className="text-[10px] text-slate-500 font-mono italic">
            No neighbors.
          </p>
        ) : (
          activeBorders.map((borderNation) => (
            <div
              key={borderNation}
              className="flex items-center justify-between p-2 bg-slate-950/40 border border-slate-800/50 rounded-lg text-[10px] font-mono text-slate-400"
            >
              <span>{borderNation}</span>
              <span className="text-rose-500 font-bold uppercase text-[8px] bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                Border
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
