import React from "react";
import { LucideIcon, Zap, Loader2, Sparkles } from "lucide-react";

export interface TacticalTechProgressCardProps {
  title: string;
  levelBadgeText: string;
  stepCostLabel: string;
  stepCostFormatted: string;
  progressToNextLabel: string;
  progressPercentFormatted: string;
  subLevelIndex: number;
  upgradeBtnText: string;
  insufficientFundsText: string;
  submittingText: string;
  canAfford: boolean;
  isSubmitting: boolean;
  colorVariant?: "amber" | "gdp";
  icon: LucideIcon;
  onUpgrade: () => void;
}

export function TacticalTechProgressCard({
  title,
  levelBadgeText,
  stepCostLabel,
  stepCostFormatted,
  progressToNextLabel,
  progressPercentFormatted,
  subLevelIndex,
  upgradeBtnText,
  insufficientFundsText,
  submittingText,
  canAfford,
  isSubmitting,
  colorVariant = "amber",
  icon: Icon,
  onUpgrade,
}: TacticalTechProgressCardProps) {
  const isAmber = colorVariant === "amber";

  const themeClasses = isAmber
    ? {
        iconColor: "text-amber-500",
        badgeBg: "bg-amber-500/10 text-amber-500 border-amber-500/30",
        costText: canAfford ? "text-amber-500" : "text-military",
        progressFill: "bg-amber-400",
        buttonBg:
          "bg-amber-500 hover:bg-amber-500/90 shadow-amber-500/20 text-primary-foreground",
      }
    : {
        iconColor: "text-gdp",
        badgeBg: "bg-gdp/10 text-gdp border-gdp/30",
        costText: canAfford ? "text-gdp" : "text-military",
        progressFill: "bg-gdp",
        buttonBg:
          "bg-gdp hover:bg-gdp/90 shadow-gdp/20 text-primary-foreground",
      };

  const isOperable = canAfford && !isSubmitting;

  return (
    <div className="space-y-2.5 text-start font-sans">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Icon size={14} className={themeClasses.iconColor} />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            {title}
          </span>
        </div>
        <span
          className={`text-[10px] font-mono font-bold border px-2.5 py-0.5 rounded-md flex items-center gap-1 ${themeClasses.badgeBg}`}
        >
          <Sparkles size={10} />
          {levelBadgeText}
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-3.5 rounded-2xl space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-xs pb-2.5 border-b border-border/50 font-mono">
          <span className="text-muted-foreground font-sans font-bold text-[11px]">
            {stepCostLabel}
          </span>
          <span className={`font-extrabold text-xs ${themeClasses.costText}`}>
            {stepCostFormatted}
          </span>
        </div>

        <div className="space-y-1.5 font-mono text-[10px]">
          <div className="flex items-center justify-between text-muted-foreground font-sans">
            <span>{progressToNextLabel}</span>
            <span className="font-bold text-foreground">
              {progressPercentFormatted}
            </span>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx < subLevelIndex
                    ? themeClasses.progressFill
                    : "bg-secondary border border-border/40"
                }`}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onUpgrade}
          disabled={!isOperable}
          className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            isOperable
              ? `${themeClasses.buttonBg} cursor-pointer shadow-sm active:scale-[0.99]`
              : "bg-secondary text-muted-foreground border border-border/60 opacity-50 cursor-not-allowed shadow-none"
          }`}
        >
          {isSubmitting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Zap size={14} />
          )}
          <span>
            {isSubmitting
              ? submittingText
              : canAfford
                ? upgradeBtnText
                : insufficientFundsText}
          </span>
        </button>
      </div>
    </div>
  );
}
