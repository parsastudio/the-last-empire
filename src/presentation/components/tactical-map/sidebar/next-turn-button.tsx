import React from "react";
import { Play, Loader2 } from "lucide-react";

interface NextTurnButtonProps {
  currentTurn: number;
  isProcessing?: boolean;
  onNextTurn: () => void;
}

export function NextTurnButton({
  currentTurn,
  isProcessing = false,
  onNextTurn,
}: NextTurnButtonProps) {
  return (
    <button
      onClick={onNextTurn}
      disabled={isProcessing}
      className="w-full py-3.5 px-4 bg-gdp hover:bg-gdp/90 disabled:opacity-50 text-primary-foreground rounded-2xl font-bold transition-all shadow-lg shadow-gdp/10 hover:shadow-xl hover:translate-y-[-1px] text-xs uppercase tracking-wider flex items-center justify-between gap-2 cursor-pointer border border-gdp/20 dir-rtl"
    >
      <div className="flex items-center gap-2">
        {isProcessing ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Play size={15} fill="currentColor" />
        )}
        <span>
          {isProcessing ? "در حال محاسبه نوبت..." : "پایان نوبت و ثبت تصمیمات"}
        </span>
      </div>
      <span className="font-mono bg-black/20 px-2.5 py-0.5 rounded-lg text-[10px]">
        نوبت: {currentTurn}
      </span>
    </button>
  );
}
