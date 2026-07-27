import React from "react";

interface TurnProgressionProps {
  currentTurn: number;
}

export function TurnProgression({ currentTurn }: TurnProgressionProps) {
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      <div className="pointer-events-auto bg-slate-950/80 backdrop-blur-xl border border-slate-900 rounded-2xl px-5 py-2.5 shadow-2xl flex items-center gap-2.5 dir-rtl text-right font-sans">
        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
          نوبت جاری بازی
        </span>
        <span className="text-xs font-black text-slate-200 font-mono bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-850">
          {new Intl.NumberFormat("fa-IR").format(currentTurn)}
        </span>
      </div>
    </div>
  );
}
