import React from "react";
import { Play } from "lucide-react";

interface NextTurnButtonProps {
  currentTurn: number;
  onNextTurn: () => void;
}

export function NextTurnButton({
  currentTurn,
  onNextTurn,
}: NextTurnButtonProps) {
  return (
    <button
      onClick={onNextTurn}
      className="w-full py-3.5 px-4 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-2xl font-bold transition-all shadow-lg shadow-gdp/10 hover:shadow-xl hover:translate-y-[-1px] text-xs uppercase tracking-wider flex items-center justify-between gap-2 cursor-pointer border border-gdp/20 dir-rtl"
    >
      <div className="flex items-center gap-2">
        <Play size={15} fill="currentColor" />
        <span>پایان نوبت و ثبت تصمیمات</span>
      </div>
      <span className="font-mono bg-black/20 px-2.5 py-0.5 rounded-lg text-[10px]">
        نوبت: {currentTurn}
      </span>
    </button>
  );
}
