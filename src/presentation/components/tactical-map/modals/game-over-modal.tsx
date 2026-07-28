import React from "react";
import { Trophy, RefreshCw } from "lucide-react";
import { VictoryStatsCard } from "./victory/victory-stats-card";

interface GameOverModalProps {
  isOpen: boolean;
  isVictory: boolean;
  winnerName: string;
  reason: string;
  turnsPlayed: number;
  finalGdp: string;
  finalPopulation: string;
  conqueredArea: string;
  onRestart: () => void;
}

export function GameOverModal({
  isOpen,
  isVictory,
  winnerName,
  reason,
  turnsPlayed,
  finalGdp,
  finalPopulation,
  conqueredArea,
  onRestart,
}: GameOverModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-fade-smooth">
      <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 text-right dir-rtl">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg ${
              isVictory
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                : "bg-rose-500/10 border-rose-500/30 text-rose-500"
            }`}
          >
            <Trophy size={28} />
          </div>
          <h2 className="text-xl font-extrabold text-foreground">
            {isVictory ? "پیروزی مطلق امپراتوری!" : "شکست و سقوط حاکمیت"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isVictory
              ? `امپراتوری ${winnerName} با موفقیت توانست بر مقدرات جهانی مسلط شود.`
              : `کشور شما تحت فشار بحران‌های داخلی یا نظامی فروپاشید.`}
          </p>
        </div>

        <div className="bg-secondary/30 p-3 rounded-2xl border border-border/40 text-[11px] text-muted-foreground leading-relaxed">
          دلیل پایان کمپین:{" "}
          <strong className="text-foreground">{reason}</strong>
        </div>

        <VictoryStatsCard
          turnsPlayed={turnsPlayed}
          finalGdp={finalGdp}
          finalPopulation={finalPopulation}
          conqueredArea={conqueredArea}
        />

        <button
          onClick={onRestart}
          className="w-full py-3.5 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gdp/10"
        >
          <RefreshCw size={15} />
          <span>شروع کمپین جدید</span>
        </button>
      </div>
    </div>
  );
}
