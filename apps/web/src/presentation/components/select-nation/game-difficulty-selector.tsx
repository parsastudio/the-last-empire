import React from "react";
import { Check } from "lucide-react";
import { GameDifficulty, DIFFICULTY_CONFIGS } from "@geopolitics/domain";
import { DIFFICULTY_VISUAL_CONFIGS } from "@/presentation/configs/game-difficulty-visuals.config";

interface GameDifficultySelectorProps {
  selectedDifficulty: GameDifficulty;
  onSelect: (difficulty: GameDifficulty) => void;
}

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
          const visual = DIFFICULTY_VISUAL_CONFIGS[key];
          const Icon = visual.icon;

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
