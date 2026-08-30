import React, { useEffect } from "react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { TacticalEffects } from "@/presentation/utils/tactical-effects";
import { GameOverHeroBanner } from "./game-over/components/game-over-hero-banner";
import { VictoryStatsCard } from "./game-over/components/victory-stats-card";
import { GameOverActionButtons } from "./game-over/components/game-over-action-buttons";

interface GameOverModalProps {
  isOpen: boolean;
  isVictory: boolean;
  winnerName: string;
  winnerCode: string;
  winnerFlagCode: string;
  reasonTitle: string;
  reasonDescription: string;
  turnsPlayed: number;
  finalGdp: string;
  finalPopulation: string;
  conqueredPixels: string;
  onInspectOrContinue: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export function GameOverModal({
  isOpen,
  isVictory,
  winnerName,
  winnerCode,
  winnerFlagCode,
  reasonTitle,
  reasonDescription,
  turnsPlayed,
  finalGdp,
  finalPopulation,
  conqueredPixels,
  onInspectOrContinue,
  onRestart,
  onHome,
}: GameOverModalProps) {
  useEffect(() => {
    if (isOpen && isVictory) {
      TacticalEffects.fireVictoryConfetti(140);
    }
  }, [isOpen, isVictory]);

  if (!isOpen) return null;

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={
        isVictory ? "پیروزی مطلق بر جهان!" : "سقوط حاکمیت و شکست در بقای ملی"
      }
      subtitle={
        isVictory
          ? "حاکمیت شما با اقتدار کامل توانست مقدرات سیاسی و اقتصادی جهان را تسخیر کند."
          : "قلمرو و ساختار حاکمیتی شما در جریان تحولات نظامی و سیاسی از بین رفت."
      }
      maxWidthClass="max-w-lg"
      onClose={onInspectOrContinue}
    >
      <div className="space-y-4 text-right dir-rtl font-sans">
        <GameOverHeroBanner
          isVictory={isVictory}
          winnerName={winnerName}
          winnerCode={winnerCode}
          winnerFlagCode={winnerFlagCode}
        />

        <div className="bg-background/60 border border-border/70 p-4 rounded-2xl space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-muted-foreground font-sans">
              شرح رویداد تاریخی:
            </span>
            <span
              className={`font-mono text-[11px] ${
                isVictory ? "text-amber-500" : "text-rose-400"
              }`}
            >
              {reasonTitle}
            </span>
          </div>
          <p className="text-xs text-foreground leading-relaxed font-sans font-medium">
            {reasonDescription}
          </p>
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono px-1 block">
            کارنامه نهایی امپراتوری شما
          </span>
          <VictoryStatsCard
            turnsPlayed={turnsPlayed}
            finalGdp={finalGdp}
            finalPopulation={finalPopulation}
            conqueredPixels={conqueredPixels}
          />
        </div>

        <GameOverActionButtons
          isVictory={isVictory}
          onInspectOrContinue={onInspectOrContinue}
          onRestart={onRestart}
          onHome={onHome}
        />
      </div>
    </UnifiedModalShell>
  );
}
