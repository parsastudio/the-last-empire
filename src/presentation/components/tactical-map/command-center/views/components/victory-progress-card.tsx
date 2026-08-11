import React, { useMemo } from "react";
import { Trophy, Swords, Coins, Sparkles } from "lucide-react";
import { GameState } from "@/domain/game/game-state.schema";
import { VictoryChecker } from "@/engine/politics/victory-checker";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface VictoryProgressCardProps {
  nationId: string;
  gameState?: GameState | null;
}

export function VictoryProgressCard({
  nationId,
  gameState,
}: VictoryProgressCardProps) {
  const metrics = useMemo(() => {
    return VictoryChecker.calculateProgress(gameState || null, nationId);
  }, [gameState, nationId]);

  return (
    <div className="space-y-3 dir-rtl text-right font-sans">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-amber-500" />
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider font-mono">
            پایش استراتژیک شروط پیروزی بر جهان
          </span>
        </div>
        <span className="text-[9px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
          <Sparkles size={10} />
          مسیر سلطه
        </span>
      </div>

      <div className="bg-background/50 border border-border/70 p-4 rounded-2xl space-y-4 shadow-inner">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Swords size={14} className="text-military shrink-0" />
              <span>فتوح نظامی و تسلط بر سرزمین‌ها</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-military font-extrabold">
                {PersianNumberFormatter.toPersianDigits(
                  metrics.territorySharePct,
                )}
                ٪
              </span>
              <span className="text-muted-foreground text-[10px]">
                از هدف{" "}
                {PersianNumberFormatter.toPersianDigits(
                  metrics.territoryTargetPct,
                )}
                ٪
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-secondary/80 h-2.5 rounded-full overflow-hidden border border-border/50 p-0.5">
              <div
                className="bg-military h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${metrics.territoryProgressPct}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] text-muted-foreground font-mono">
              <span>میزان تکمیلی مسیر فتح:</span>
              <span className="font-bold text-foreground">
                {PersianNumberFormatter.toPersianDigits(
                  metrics.territoryProgressPct,
                )}
                ٪
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 pt-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Coins size={14} className="text-gdp shrink-0" />
              <span>هژمونی و انحصار اقتصاد جهانی (GDP)</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-gdp font-extrabold">
                {PersianNumberFormatter.toPersianDigits(metrics.gdpSharePct)}٪
              </span>
              <span className="text-muted-foreground text-[10px]">
                از هدف{" "}
                {PersianNumberFormatter.toPersianDigits(metrics.gdpTargetPct)}٪
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-secondary/80 h-2.5 rounded-full overflow-hidden border border-border/50 p-0.5">
              <div
                className="bg-gdp h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${metrics.gdpProgressPct}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] text-muted-foreground font-mono">
              <span>میزان تکمیلی تسلط اقتصادی:</span>
              <span className="font-bold text-foreground">
                {PersianNumberFormatter.toPersianDigits(metrics.gdpProgressPct)}
                ٪
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
