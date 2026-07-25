import React from "react";
import { Nation } from "@/domain/nation/nation.schema";

interface RankingItem {
  id: string;
  score: number;
  rank: number;
}

interface GlobalLeaderboardPanelProps {
  ranks: RankingItem[];
  nations: Record<string, Nation>;
  humanNationId: string;
}

export function GlobalLeaderboardPanel({
  ranks,
  nations,
  humanNationId,
}: GlobalLeaderboardPanelProps) {
  return (
    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 space-y-3 flex-1 flex flex-col min-h-0">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
        Global Sovereignties
      </h3>
      <div className="space-y-2 overflow-y-auto max-h-56 pr-1">
        {ranks.map((item) => {
          const details = nations[item.id];
          if (!details) return null;
          const isPlayer = item.id === humanNationId;

          return (
            <div
              key={item.id}
              className={`flex justify-between items-center p-2 rounded-xl text-[11px] border font-mono transition-all ${
                isPlayer
                  ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                  : "bg-slate-900/40 border-slate-800/50 text-slate-300 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500">#{item.rank}</span>
                <span className="font-semibold truncate max-w-[120px]">
                  {details.name}
                </span>
              </div>
              <span className="font-bold text-white">
                ${(details.gdp / 1e9).toFixed(1)}B
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
