import React from "react";
import { Compass, Eye, RefreshCw, Home } from "lucide-react";

interface GameOverActionButtonsProps {
  isVictory: boolean;
  onInspectOrContinue: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export function GameOverActionButtons({
  isVictory,
  onInspectOrContinue,
  onRestart,
  onHome,
}: GameOverActionButtonsProps) {
  return (
    <div className="space-y-2.5 pt-2">
      <button
        onClick={onInspectOrContinue}
        className={`w-full py-3.5 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all border ${
          isVictory
            ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/20 border-emerald-400/40"
            : "bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:to-slate-500 shadow-black/30 border-slate-500/40"
        }`}
      >
        {isVictory ? <Compass size={16} /> : <Eye size={16} />}
        <span>
          {isVictory
            ? "ادامه سلطنت و جهان‌گشایی آزاد (حالت سندباکس)"
            : "پایش نقشه جهان و تحلیل وقایع تاریخی (حالت تماشاچی)"}
        </span>
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          onClick={onRestart}
          className="py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-primary/20"
        >
          <RefreshCw size={14} />
          <span>شروع کمپین جدید</span>
        </button>

        <button
          onClick={onHome}
          className="py-3 bg-secondary hover:bg-secondary/80 border border-border text-foreground rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          <Home size={14} />
          <span>بازگشت به منوی اصلی</span>
        </button>
      </div>
    </div>
  );
}
