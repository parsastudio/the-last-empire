import React from "react";

interface EmpireStatsCardProps {
  playerCountryCode: string;
  empireStats: {
    totalGdp: number;
    totalPopulation: number;
    totalTerritories: number;
  };
}

export function EmpireStatsCard({
  playerCountryCode,
  empireStats,
}: EmpireStatsCardProps) {
  return (
    <div>
      <h2 className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
        {playerCountryCode} Empire Stats
      </h2>
      <div className="space-y-1.5 font-mono text-xs bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 text-slate-300">
        <div>
          Control Size:{" "}
          <span className="text-white font-bold">
            {empireStats.totalTerritories.toFixed(2)} units
          </span>
        </div>
        <div>
          Total GDP:{" "}
          <span className="text-white font-bold">
            ${(empireStats.totalGdp / 1e9).toFixed(1)}B
          </span>
        </div>
        <div>
          Population:{" "}
          <span className="text-white font-bold">
            ${(empireStats.totalPopulation / 1e6).toFixed(1)}M
          </span>
        </div>
      </div>
    </div>
  );
}
