import React, { useEffect } from "react";
import { Trophy, RefreshCw, Award, Globe2, Coins, Users } from "lucide-react";
import confetti from "canvas-confetti";

function VictoryStatsCard({
  turnsPlayed,
  finalGdp,
  finalPopulation,
  conqueredArea,
}: {
  turnsPlayed: number;
  finalGdp: string;
  finalPopulation: string;
  conqueredArea: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 font-mono text-xs dir-rtl">
      <div className="bg-secondary/50 p-3.5 rounded-2xl space-y-1 border border-border/60">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans font-bold">
          <Award size={13} className="text-amber-500" />
          <span>تعداد نوبت‌ها</span>
        </div>
        <span className="font-bold text-foreground block">{turnsPlayed}</span>
      </div>

      <div className="bg-secondary/50 p-3.5 rounded-2xl space-y-1 border border-border/60">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans font-bold">
          <Coins size={13} className="text-gdp" />
          <span>تولید ناخالص نهایی</span>
        </div>
        <span className="font-bold text-foreground block">{finalGdp}</span>
      </div>

      <div className="bg-secondary/50 p-3.5 rounded-2xl space-y-1 border border-border/60">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans font-bold">
          <Users size={13} className="text-primary" />
          <span>جمعیت کل امپراتوری</span>
        </div>
        <span className="font-bold text-foreground block">
          {finalPopulation}
        </span>
      </div>

      <div className="bg-secondary/50 p-3.5 rounded-2xl space-y-1 border border-border/60">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans font-bold">
          <Globe2 size={13} className="text-military" />
          <span>مساحت تحت کنترل</span>
        </div>
        <span className="font-bold text-foreground block">{conqueredArea}</span>
      </div>
    </div>
  );
}

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
  useEffect(() => {
    if (isOpen && isVictory) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [isOpen, isVictory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-2xl flex items-center justify-center p-4 z-50 animate-fade-smooth">
      <div className="bg-card/95 border border-border/80 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 text-right dir-rtl border-t-amber-500/40">
        <div className="flex flex-col items-center justify-center gap-2.5 text-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xl ${
              isVictory
                ? "bg-amber-500/15 border-amber-500/40 text-amber-500"
                : "bg-rose-500/15 border-rose-500/40 text-rose-500"
            }`}
          >
            <Trophy size={32} />
          </div>
          <h2 className="text-xl font-black text-foreground">
            {isVictory ? "پیروزی مطلق امپراتوری!" : "شکست و سقوط حاکمیت"}
          </h2>
          <p className="text-xs text-muted-foreground font-sans leading-relaxed">
            {isVictory
              ? `امپراتوری ${winnerName} با موفقیت توانست بر مقدرات جهانی مسلط شود.`
              : `کشور شما تحت فشار بحران‌های داخلی یا نظامی فروپاشید.`}
          </p>
        </div>

        <div className="bg-secondary/40 p-3.5 rounded-2xl border border-border/60 text-[11px] text-muted-foreground leading-relaxed font-sans">
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
          className="w-full py-4 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-gdp/20 hover:scale-[1.01] active:scale-[0.99] transition-all border border-gdp/30"
        >
          <RefreshCw size={16} />
          <span>شروع کمپین جدید</span>
        </button>
      </div>
    </div>
  );
}
