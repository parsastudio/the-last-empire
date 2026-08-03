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
      className="w-full py-4 px-4 bg-gdp hover:bg-gdp/90 disabled:opacity-50 text-primary-foreground rounded-2xl font-black transition-all shadow-xl shadow-gdp/20 hover:shadow-gdp/30 hover:scale-[1.01] active:scale-[0.99] text-xs uppercase tracking-wider flex items-center justify-between gap-2 cursor-pointer border border-gdp/30 dir-rtl"
    >
      <div className="flex items-center gap-2.5">
        {isProcessing ? (
          <Loader2 size={16} className="animate-spin text-primary-foreground" />
        ) : (
          <Play
            size={16}
            fill="currentColor"
            className="text-primary-foreground"
          />
        )}
        <span className="font-sans">
          {isProcessing ? "در حال محاسبه نوبت..." : "پایان نوبت و ثبت تصمیمات"}
        </span>
      </div>
      <span className="font-mono bg-black/25 px-2.5 py-1 rounded-xl text-[10px] font-bold">
        نوبت: {currentTurn}
      </span>
    </button>
  );
}
