import React, { useState } from "react";
import { TurnLogEntry } from "@/domain/game/game-state.schema";
import {
  ShieldAlert,
  Swords,
  Terminal,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface IntelligenceFeedProps {
  logs: TurnLogEntry[];
}

export function IntelligenceFeed({ logs }: IntelligenceFeedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeLogs = logs.slice(-5).reverse();

  const getLogStyle = (level: string) => {
    switch (level) {
      case "COMBAT":
        return {
          bg: "bg-rose-950/20 border-rose-900/30",
          text: "text-rose-400",
          icon: Swords,
        };
      case "CRITICAL":
        return {
          bg: "bg-red-950/20 border-red-900/30",
          text: "text-red-400",
          icon: ShieldAlert,
        };
      default:
        return {
          bg: "bg-slate-950/50 border-slate-900/50",
          text: "text-slate-300",
          icon: Terminal,
        };
    }
  };

  return (
    <div className="absolute bottom-6 right-6 z-40 w-full max-w-sm pointer-events-none">
      <div className="pointer-events-auto bg-slate-950/80 backdrop-blur-xl border border-slate-900 rounded-3xl p-4 shadow-2xl flex flex-col gap-3.5 dir-rtl text-right font-sans">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Terminal size={13} className="text-slate-500" />
            <span className="text-[10px] font-black uppercase tracking-wider">
              گزارش زنده رویدادها
            </span>
          </div>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activeLogs.length === 0 ? (
                  <p className="text-[10px] text-slate-600 italic py-6 text-center">
                    هیچ رویداد تاکتیکی اخیری ثبت نشده است.
                  </p>
                ) : (
                  activeLogs.map((log) => {
                    const style = getLogStyle(log.level);
                    const LogIcon = style.icon;
                    return (
                      <div
                        key={log.id}
                        className={`p-3 border rounded-2xl flex gap-3 text-xs leading-relaxed ${style.bg} ${style.text}`}
                      >
                        <LogIcon size={14} className="shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[10px] text-slate-500 font-mono">
                            نوبت{" "}
                            {new Intl.NumberFormat("fa-IR").format(log.turn)}
                          </div>
                          <p className="text-[10px] mt-1 text-slate-200">
                            {log.message}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
