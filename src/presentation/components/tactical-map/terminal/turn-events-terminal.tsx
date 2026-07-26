import React, { useState } from "react";
import { TurnLogEntry } from "@/domain/game/game-state.schema";
import { Terminal, X } from "lucide-react";

interface TurnEventsTerminalProps {
  logs: TurnLogEntry[];
}

export function TurnEventsTerminal({ logs }: TurnEventsTerminalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const reversedLogs = [...logs].reverse();

  return (
    <div className="absolute bottom-4 right-4 z-40 flex flex-col items-end gap-3 pointer-events-none">
      {isOpen && (
        <div className="w-80 h-[380px] bg-slate-950/95 border border-slate-900 rounded-3xl p-5 flex flex-col gap-3 shadow-2xl pointer-events-auto animate-in slide-in-from-bottom duration-200">
          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
            <div>
              <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase font-mono">
                Sovereign Logs
              </span>
              <h2 className="text-xs font-bold text-white tracking-tight mt-0.5">
                Campaign Intelligence
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-300"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3 font-mono text-[10px]">
            {reversedLogs.length === 0 ? (
              <div className="text-slate-600 italic">
                No events recorded in simulation history.
              </div>
            ) : (
              reversedLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-slate-900/40 border border-slate-950 rounded-2xl space-y-1.5 leading-relaxed"
                >
                  <div className="flex justify-between text-slate-500 font-bold">
                    <span>TURN {log.turn}</span>
                    <span
                      className={
                        log.level === "COMBAT"
                          ? "text-rose-500"
                          : "text-emerald-500"
                      }
                    >
                      {log.level}
                    </span>
                  </div>
                  <div className="text-slate-300">{log.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-slate-950/95 border border-slate-900 p-3.5 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl hover:shadow-emerald-950/10 pointer-events-auto"
      >
        <Terminal size={18} />
      </button>
    </div>
  );
}
