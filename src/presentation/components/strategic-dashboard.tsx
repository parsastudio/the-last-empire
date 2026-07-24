import React from "react";
import type { Province } from "@/domain/map/province.schema";
import { DashboardHeader } from "./dashboard/dashboard-header";
import { EmpireStatsCard } from "./dashboard/empire-stats-card";
import { NeighborsListCard } from "./dashboard/neighbors-list-card";
import { ConquestsListCard } from "./dashboard/conquests-list-card";

interface StrategicDashboardProps {
  playerCountryCode: string | null;
  empireStats: {
    totalGdp: number;
    totalPopulation: number;
    totalTerritories: number;
  };
  activeBorders: string[];
  conquests: (Province & { occupiedPercent: number })[];
  onReset: () => void;
}

export function StrategicDashboard({
  playerCountryCode,
  empireStats,
  activeBorders,
  conquests,
  onReset,
}: StrategicDashboardProps) {
  return (
    <div className="w-full bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
      <DashboardHeader onReset={onReset} />

      {!playerCountryCode ? (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
          <p className="text-xs text-blue-400 font-semibold animate-pulse">
            Click on any country to select and start!
          </p>
        </div>
      ) : (
        <>
          <EmpireStatsCard
            playerCountryCode={playerCountryCode}
            empireStats={empireStats}
          />

          <NeighborsListCard activeBorders={activeBorders} />

          <ConquestsListCard conquests={conquests} />
        </>
      )}
    </div>
  );
}
