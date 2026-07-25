import React from "react";
import { TurnLogEntry } from "@/domain/game/game-state.schema";

interface CampaignLogOverlayProps {
  logs: TurnLogEntry[];
}

export function CampaignLogOverlay({ logs }: CampaignLogOverlayProps) {
  const visibleLogs = logs.slice(-4).reverse();

  return (
    <div className="absolute bottom-20 right-6 max-w-sm w-full bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-2xl p-4 space-y-2 z-40">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        Invasion Campaign Intelligence
      </div>
      <div className="space-y-1.5 h-24 overflow-y-auto pr-1">
        {visibleLogs.length === 0 ? (
          <div className="text-xs text-slate-600 italic">
            No military actions logged.
          </div>
        ) : (
          visibleLogs.map((log) => (
            <div
              key={log.id}
              className="text-[11px] font-mono text-emerald-400/90 leading-tight"
            >
              [{log.turn}] {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
