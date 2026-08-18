import React, { useMemo } from "react";
import { Trophy, Swords, Coins, Sparkles, Target } from "lucide-react";
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="bg-background/60 border border-military/30 hover:border-military/60 p-4 rounded-2xl space-y-3 shadow-lg relative overflow-hidden transition-all group flex flex-col justify-between">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-military/60 via-rose-500/40 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Swords size={15} className="text-military shrink-0" />
              <span>سلطه نظامی و قلمرو</span>
            </div>
            <span className="text-[9px] font-mono bg-military/15 text-military px-2 py-0.5 rounded-md font-bold border border-military/30">
              هدف:{" "}
              {PersianNumberFormatter.toPersianDigits(
                metrics.territoryTargetPct,
              )}
              ٪
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-2 text-center space-y-1">
            <span className="text-3xl md:text-4xl font-black font-mono text-military tracking-tight drop-shadow-sm">
              {PersianNumberFormatter.toPersianDigits(
                metrics.territorySharePct,
              )}
              ٪
            </span>
            <span className="text-[10px] text-muted-foreground font-sans">
              سهم فعال از وسعت قلمروهای جهان
            </span>
          </div>

          <div className="bg-secondary/50 border border-border/50 p-2 rounded-xl flex items-center justify-between text-[10px] font-mono">
            <span className="text-muted-foreground font-sans flex items-center gap-1">
              <Target size={11} className="text-military" />
              پیشرفت تا فتح:
            </span>
            <span className="font-extrabold text-foreground">
              {PersianNumberFormatter.toPersianDigits(
                metrics.territoryProgressPct,
              )}
              ٪
            </span>
          </div>
        </div>

        <div className="bg-background/60 border border-gdp/30 hover:border-gdp/60 p-4 rounded-2xl space-y-3 shadow-lg relative overflow-hidden transition-all group flex flex-col justify-between">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-gdp/60 via-emerald-500/40 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Coins size={15} className="text-gdp shrink-0" />
              <span>هژمونی اقتصاد جهانی</span>
            </div>
            <span className="text-[9px] font-mono bg-gdp/15 text-gdp px-2 py-0.5 rounded-md font-bold border border-gdp/30">
              هدف:{" "}
              {PersianNumberFormatter.toPersianDigits(metrics.gdpTargetPct)}٪
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-2 text-center space-y-1">
            <span className="text-3xl md:text-4xl font-black font-mono text-gdp tracking-tight drop-shadow-sm">
              {PersianNumberFormatter.toPersianDigits(metrics.gdpSharePct)}٪
            </span>
            <span className="text-[10px] text-muted-foreground font-sans">
              سهم فعال از تولید ناخالص (GDP) جهان
            </span>
          </div>

          <div className="bg-secondary/50 border border-border/50 p-2 rounded-xl flex items-center justify-between text-[10px] font-mono">
            <span className="text-muted-foreground font-sans flex items-center gap-1">
              <Target size={11} className="text-gdp" />
              پیشرفت تا هژمونی:
            </span>
            <span className="font-extrabold text-foreground">
              {PersianNumberFormatter.toPersianDigits(metrics.gdpProgressPct)}٪
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
