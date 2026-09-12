import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Swords, Coins, Sparkles, Target } from "lucide-react";
import { GameState } from "@/domain/game/game-state.schema";
import { VictoryChecker } from "@/engine/politics/victory-checker";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface VictoryProgressCardProps {
  nationId: string;
  gameState?: GameState | null;
}

export function VictoryProgressCard({
  nationId,
  gameState,
}: VictoryProgressCardProps) {
  const t = useTranslations("overview.victory");
  const { formatPercent } = useLocaleFormatter();

  const metrics = useMemo(() => {
    return VictoryChecker.calculateProgress(gameState || null, nationId);
  }, [gameState, nationId]);

  const territoryFillPercent = Math.min(
    100,
    (metrics.territorySharePct / metrics.territoryTargetPct) * 100,
  );

  const gdpFillPercent = Math.min(
    100,
    (metrics.gdpSharePct / metrics.gdpTargetPct) * 100,
  );

  return (
    <div className="space-y-3 text-start font-sans">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-amber-500" />
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider font-mono">
            {t("title")}
          </span>
        </div>
        <span className="text-[9px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
          <Sparkles size={10} />
          {t("endConditions")}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="bg-card/90 border border-military/30 hover:border-military/50 p-4.5 rounded-3xl space-y-3.5 shadow-lg relative overflow-hidden transition-all flex flex-col justify-between">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-military via-rose-500/40 to-transparent" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-foreground">
              <Swords size={16} className="text-military shrink-0" />
              <span>{t("militaryTitle")}</span>
            </div>
            <span className="text-[10px] font-mono text-military font-bold bg-military/10 px-2 py-0.5 rounded-lg border border-military/20">
              {t("militaryTarget")}
            </span>
          </div>

          <div className="space-y-1.5 py-1">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl md:text-3xl font-black font-mono text-military tracking-tight">
                {formatPercent(metrics.territorySharePct, 1)}
              </span>
              <span className="text-[11px] text-muted-foreground font-sans">
                {t("territoryExtent")}
              </span>
            </div>

            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden border border-border/60">
              <div
                className="h-full rounded-full transition-all duration-500 bg-military shadow-sm shadow-military/50"
                style={{ width: `${territoryFillPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-card/90 border border-gdp/30 hover:border-gdp/50 p-4.5 rounded-3xl space-y-3.5 shadow-lg relative overflow-hidden transition-all flex flex-col justify-between">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-gdp via-emerald-500/40 to-transparent" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-foreground">
              <Coins size={16} className="text-gdp shrink-0" />
              <span>{t("economicTitle")}</span>
            </div>
            <span className="text-[10px] font-mono text-gdp font-bold bg-gdp/10 px-2 py-0.5 rounded-lg border border-gdp/20">
              {t("economicTarget")}
            </span>
          </div>

          <div className="space-y-1.5 py-1">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl md:text-3xl font-black font-mono text-gdp tracking-tight">
                {formatPercent(metrics.gdpSharePct, 1)}
              </span>
              <span className="text-[11px] text-muted-foreground font-sans">
                {t("wealthExtent")}
              </span>
            </div>

            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden border border-border/60">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gdp shadow-sm shadow-gdp/50"
                style={{ width: `${gdpFillPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
