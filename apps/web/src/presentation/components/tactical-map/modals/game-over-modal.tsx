import React, { useEffect } from "react";
import {
  Trophy,
  RefreshCw,
  Award,
  Globe2,
  Coins,
  Users,
  Home,
  Crown,
  Compass,
  Skull,
  Eye,
} from "lucide-react";
import confetti from "canvas-confetti";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

function VictoryStatsCard({
  turnsPlayed,
  finalGdp,
  finalPopulation,
  conqueredPixels,
}: {
  turnsPlayed: number;
  finalGdp: string;
  finalPopulation: string;
  conqueredPixels: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 font-mono text-xs dir-rtl">
      <div className="bg-secondary/50 p-3.5 rounded-2xl space-y-1 border border-border/60">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans font-bold">
          <Award size={13} className="text-amber-500" />
          <span>تعداد نوبت‌های سپری‌شده</span>
        </div>
        <span className="font-bold text-foreground block">
          {PersianNumberFormatter.toPersianDigits(turnsPlayed)} نوبت
        </span>
      </div>

      <div className="bg-secondary/50 p-3.5 rounded-2xl space-y-1 border border-border/60">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans font-bold">
          <Coins size={13} className="text-gdp" />
          <span>تولید ناخالص امپراتوری شما</span>
        </div>
        <span className="font-bold text-foreground block">{finalGdp}</span>
      </div>

      <div className="bg-secondary/50 p-3.5 rounded-2xl space-y-1 border border-border/60">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans font-bold">
          <Users size={13} className="text-primary" />
          <span>جمعیت کل کشور شما</span>
        </div>
        <span className="font-bold text-foreground block">
          {finalPopulation}
        </span>
      </div>

      <div className="bg-secondary/50 p-3.5 rounded-2xl space-y-1 border border-border/60">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans font-bold">
          <Globe2 size={13} className="text-military" />
          <span>وسعت قلمرو تحت کنترل</span>
        </div>
        <span className="font-bold text-foreground block">
          {conqueredPixels}
        </span>
      </div>
    </div>
  );
}

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
      try {
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [isOpen, isVictory]);

  if (!isOpen) return null;

  const winnerFlag = getFlagEmoji(winnerFlagCode || winnerCode);

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
                {isVictory ? "امپراتوری پیروز شما" : "قدرت برتر میدان نبرد"}
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
      </div>
    </UnifiedModalShell>
  );
}
