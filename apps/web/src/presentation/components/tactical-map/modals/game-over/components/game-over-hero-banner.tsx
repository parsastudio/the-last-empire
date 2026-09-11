import React from "react";
import { useTranslations } from "next-intl";
import { Trophy, Skull, Crown } from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

interface GameOverHeroBannerProps {
  isVictory: boolean;
  winnerName: string;
  winnerCode: string;
  winnerFlagCode: string;
}

export function GameOverHeroBanner({
  isVictory,
  winnerName,
  winnerCode,
  winnerFlagCode,
}: GameOverHeroBannerProps) {
  const t = useTranslations("gameOver.hero");
  const winnerFlag = getFlagEmoji(winnerFlagCode || winnerCode);

  return (
    <div
      className={`p-4.5 rounded-3xl border flex items-center justify-between gap-4 transition-all shadow-lg backdrop-blur-xl ${
        isVictory
          ? "bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/15 border-amber-500/40 text-foreground"
          : "bg-gradient-to-r from-rose-950/40 via-card to-rose-950/30 border-rose-500/40 text-foreground"
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center text-4xl shadow-inner select-none shrink-0">
          {winnerFlag}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {isVictory ? (
              <Crown size={16} className="text-amber-500" />
            ) : (
              <Skull size={16} className="text-rose-400" />
            )}
            <span className="text-sm font-black text-foreground">
              {winnerName}
            </span>
            <span className="text-[10px] font-mono font-bold bg-secondary px-2 py-0.5 rounded text-muted-foreground">
              {winnerCode}
            </span>
          </div>
          <span
            className={`text-[11px] font-bold block ${
              isVictory ? "text-amber-500" : "text-rose-400"
            }`}
          >
            {isVictory ? t("yourVictoriousEmpire") : t("superiorPower")}
          </span>
        </div>
      </div>

      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-md shrink-0 ${
          isVictory
            ? "bg-amber-500/20 border-amber-500/40 text-amber-500"
            : "bg-rose-500/20 text-rose-400 border-rose-500/40"
        }`}
      >
        {isVictory ? <Trophy size={24} /> : <Skull size={24} />}
      </div>
    </div>
  );
}
