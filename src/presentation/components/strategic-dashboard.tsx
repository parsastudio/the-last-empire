import React from "react";
import type { Province } from "@/domain/map/province.schema";

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
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <h1 className="text-sm font-extrabold tracking-tight text-white uppercase">
          Strategic Dashboard
        </h1>
        <button
          onClick={onReset}
          className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg transition-colors border border-rose-500/30"
        >
          Reset Map
        </button>
      </div>

      {!playerCountryCode ? (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
          <p className="text-xs text-blue-400 font-semibold animate-pulse">
            Click on any country to select and start!
          </p>
        </div>
      ) : (
        <>
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
                activeBorders.map((borderNation: string) => (
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
                conquests.map((p: Province & { occupiedPercent: number }) => (
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
                      {((p.gdp * (p.occupiedPercent / 100)) / 1e9).toFixed(1)}B
                      | Pop: $
                      {(
                        (p.population * (p.occupiedPercent / 100)) /
                        1e6
                      ).toFixed(1)}
                      M
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
