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
    <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-950 space-y-3">
      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
        Global Rankings
      </h3>
      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
        {ranks.map((item) => {
          const details = nations[item.id];
          if (!details) return null;
          const isPlayer = item.id === humanNationId;

          return (
            <div
              key={item.id}
              className={`flex justify-between items-center p-2 rounded-xl text-[10px] font-mono border transition-all ${
                isPlayer
                  ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-300"
                  : "bg-slate-900/20 border-transparent text-slate-400 hover:border-slate-850"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-bold">#{item.rank}</span>
                <span className="truncate max-w-[100px]">{details.name}</span>
              </div>
              <span className="text-white font-bold">
                ${(details.gdp / 1e9).toFixed(1)}B
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
