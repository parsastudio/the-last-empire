import React from "react";
import {
  ShieldCheck,
  Compass,
  Flame,
  Skull,
  LucideIcon,
  Check,
} from "lucide-react";
import { GameDifficulty, DIFFICULTY_CONFIGS } from "@geopolitics/domain";

interface GameDifficultySelectorProps {
  selectedDifficulty: GameDifficulty;
  onSelect: (difficulty: GameDifficulty) => void;
}

const DIFFICULTY_ICONS: Record<GameDifficulty, LucideIcon> = {
  EASY: ShieldCheck,
  NORMAL: Compass,
  HARD: Flame,
  IMPOSSIBLE: Skull,
};

const DIFFICULTY_VISUALS: Record<
  GameDifficulty,
  {
    activeBorder: string;
    activeBg: string;
    badgeBg: string;
    textColor: string;
  }
> = {
  EASY: {
    activeBorder:
      "border-emerald-500 shadow-emerald-500/10 ring-emerald-500/40",
    activeBg: "bg-emerald-500/15",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    textColor: "text-emerald-400",
  },
  NORMAL: {
    activeBorder: "border-primary shadow-primary/10 ring-primary/40",
    activeBg: "bg-primary/15",
    badgeBg: "bg-primary/20 text-primary border-primary/40",
    textColor: "text-primary",
  },
  HARD: {
    activeBorder: "border-amber-500 shadow-amber-500/10 ring-amber-500/40",
    activeBg: "bg-amber-500/15",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    textColor: "text-amber-400",
  },
  IMPOSSIBLE: {
    activeBorder: "border-rose-500 shadow-rose-500/20 ring-rose-500/50",
    activeBg: "bg-rose-500/20",
    badgeBg: "bg-rose-500/25 text-rose-300 border-rose-500/50 animate-pulse",
    textColor: "text-rose-400",
  },
};

export function GameDifficultySelector({
  selectedDifficulty,
  onSelect,
}: GameDifficultySelectorProps) {
  return (
    <div className="space-y-2.5 dir-rtl text-right font-sans">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-black text-muted-foreground uppercase tracking-wider font-mono">
          سطح دشواری بازی
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {(Object.keys(DIFFICULTY_CONFIGS) as GameDifficulty[]).map((key) => {
          const config = DIFFICULTY_CONFIGS[key];
          const isSelected = selectedDifficulty === key;
          const Icon = DIFFICULTY_ICONS[key];
          const visual = DIFFICULTY_VISUALS[key];

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={`p-3.5 rounded-2xl text-right transition-all border flex flex-col justify-between gap-3 cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? `${visual.activeBg} ${visual.activeBorder} shadow-lg ring-1 scale-[1.01]`
                  : "bg-background/40 border-border/70 hover:bg-secondary/50 hover:border-border"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                    isSelected
                      ? visual.badgeBg
                      : "bg-secondary text-muted-foreground border-border/60 group-hover:text-foreground"
                  }`}
                >
                  <Icon size={16} />
                </div>

                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? visual.badgeBg
                      : "border-border/70 bg-background"
                  }`}
                >
                  {isSelected && <Check size={10} strokeWidth={3} />}
                </span>
              </div>

              <div className="space-y-0.5">
                <span
                  className={`text-xs font-black block ${
                    isSelected ? visual.textColor : "text-foreground"
                  }`}
                >
                  {config.nameFa}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate font-medium">
                  {config.taglineFa}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
