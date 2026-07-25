import React from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { SovereignStatsPanel } from "../panel/sovereign-stats-panel";
import { GlobalLeaderboardPanel } from "../panel/global-leaderboard-panel";

interface LeftSovereignSidebarProps {
  humanNation: Nation;
  rankings: Array<{ id: string; score: number; rank: number }>;
  nations: Record<string, Nation>;
}

export function LeftSovereignSidebar({
  humanNation,
  rankings,
  nations,
}: LeftSovereignSidebarProps) {
  return (
    <div className="absolute top-20 left-4 w-80 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-5 rounded-3xl flex flex-col gap-5 z-40 max-h-[85vh] overflow-y-auto shadow-2xl">
      <div className="space-y-1 border-b border-slate-800 pb-4">
        <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase font-mono">
          Primary Sovereign Authority
        </span>
        <h2 className="text-base font-bold text-white tracking-tight">
          {humanNation.name}
        </h2>
      </div>
      <SovereignStatsPanel nation={humanNation} />
      <GlobalLeaderboardPanel
        ranks={rankings}
        nations={nations}
        humanNationId={humanNation.id}
      />
    </div>
  );
}
