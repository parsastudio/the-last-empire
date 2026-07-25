import React from "react";
import { TurnLogEntry } from "@/domain/game/game-state.schema";

interface TurnLogsTerminalProps {
  logs: TurnLogEntry[];
}

export function TurnLogsTerminal({ logs }: TurnLogsTerminalProps) {
  const reversedLogs = [...logs].reverse();

  return (
    <div className="w-80 bg-slate-900/90 backdrop-blur-md border-l border-slate-800 p-5 flex flex-col h-full space-y-4 overflow-hidden">
      <div className="space-y-1 border-b border-slate-800 pb-4">
        <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
          Global Logs
        </span>
        <h2 className="text-sm font-bold text-white tracking-tight">
          Campaign Intelligence
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 font-mono text-[10px]">
        {reversedLogs.length === 0 ? (
          <div className="text-slate-600 italic">
            No worldwide logs published.
          </div>
        ) : (
          reversedLogs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1 leading-snug"
            >
              <div className="flex justify-between text-slate-500 font-bold">
                <span>TURN {log.turn}</span>
                <span className="text-emerald-500">{log.level}</span>
              </div>
              <div className="text-slate-300">{log.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
