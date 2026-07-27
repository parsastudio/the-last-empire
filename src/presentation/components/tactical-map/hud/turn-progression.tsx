import React from "react";
import { Play, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

interface TurnProgressionProps {
  currentTurn: number;
  globalThreatLevel: number;
  onAdvanceTurn: () => void;
  isAdvancing: boolean;
}

export function TurnProgression({
  currentTurn,
  globalThreatLevel,
  onAdvanceTurn,
  isAdvancing,
}: TurnProgressionProps) {
  const getThreatColor = (level: number) => {
    if (level < 30) return "bg-emerald-500";
    if (level < 70) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4 pointer-events-none">
      <div className="pointer-events-auto bg-slate-950/80 backdrop-blur-xl border border-slate-900 rounded-3xl p-3.5 shadow-2xl flex items-center justify-between gap-6 dir-rtl text-right font-sans">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 border border-slate-850 px-3.5 py-2 rounded-2xl flex flex-col items-center">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">
              نوبت جاری
            </span>
            <span className="text-sm font-black text-slate-200 font-mono mt-0.5">
              {new Intl.NumberFormat("fa-IR").format(currentTurn)}
            </span>
          </div>

          <div className="space-y-1.5 min-w-[110px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <ShieldAlert size={12} className="text-slate-500" />
              <span className="text-[10px] font-bold">میزان تنش جهانی</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-950">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${globalThreatLevel}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full ${getThreatColor(globalThreatLevel)}`}
              />
            </div>
          </div>
        </div>

        <button
          onClick={onAdvanceTurn}
          disabled={isAdvancing}
          className="relative px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-2xl font-bold transition-all border border-emerald-500/20 shadow-lg shadow-emerald-950/20 text-xs font-sans flex items-center gap-2.5 cursor-pointer overflow-hidden"
        >
          {isAdvancing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play size={13} className="fill-current rotate-180" />
          )}
          <span>{isAdvancing ? "محاسبه زمان..." : "پایان نوبت"}</span>
        </button>
      </div>
    </div>
  );
}
