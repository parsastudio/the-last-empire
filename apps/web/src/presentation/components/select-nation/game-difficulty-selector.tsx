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
  const activeConfig = DIFFICULTY_CONFIGS[selectedDifficulty];

  return (
    <div className="space-y-3.5 dir-rtl text-right font-sans">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-black text-muted-foreground uppercase tracking-wider font-mono">
          انتخاب درجه چالش و سطح سختی جهان
        </span>
        <span className="text-[11px] text-muted-foreground font-mono">
          تعیین‌کننده ضریب درآمد و شتاب صنعتی رقبا
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
                  ? `${visual.activeBg} ${visual.activeBorder} shadow-lg ring-1 scale-[1.02]`
                  : "bg-background/50 border-border/70 hover:bg-secondary/60 hover:border-border"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                    isSelected
                      ? `${visual.badgeBg}`
                      : "bg-secondary text-muted-foreground border-border/60 group-hover:text-foreground"
                  }`}
                >
                  <Icon size={18} />
                </div>

                <span
                  className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? `${visual.badgeBg}`
                      : "border-border/80 bg-background"
                  }`}
                >
                  {isSelected && <Check size={11} strokeWidth={3} />}
                </span>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-black block ${
                      isSelected ? visual.textColor : "text-foreground"
                    }`}
                  >
                    {config.nameFa}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                      isSelected
                        ? visual.badgeBg
                        : "bg-secondary text-muted-foreground border-border/50"
                    }`}
                  >
                    {config.badgeText}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground block truncate">
                  {config.taglineFa}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-3.5 rounded-2xl bg-background/50 border border-border/60 text-xs text-foreground/90 leading-relaxed shadow-inner">
        <span className="font-bold text-foreground block mb-0.5">
          اثرات عملیاتی: {activeConfig.taglineFa}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {activeConfig.descriptionFa}
        </span>
      </div>
    </div>
  );
}
