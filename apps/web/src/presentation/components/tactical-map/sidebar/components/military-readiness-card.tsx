import React from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, Crosshair, TrendingUp } from "lucide-react";
import { MilitaryPowerCalculator } from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface MilitaryReadinessCardProps {
  techLevel: number;
}

export function MilitaryReadinessCard({
  techLevel,
}: MilitaryReadinessCardProps) {
  const t = useTranslations("military");
  const { formatLevel, formatPercent } = useLocaleFormatter();
  const techMult = MilitaryPowerCalculator.calculateTechMultiplier(techLevel);
  const bonusPercent = Math.round((techMult - 1) * 100);

  return (
    <div className="bg-card/90 border border-border/80 p-4 rounded-3xl flex items-center justify-between gap-3 text-start font-sans shadow-lg backdrop-blur-2xl ring-1 ring-white/5 relative overflow-hidden">
      <div className="absolute top-0 start-0 end-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
          <Crosshair size={18} className="animate-pulse" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <span className="text-xs font-black text-foreground block truncate">
            {t("readinessTitle")}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono block">
            {formatLevel(techLevel)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {bonusPercent > 0 && (
          <span className="text-[10px] font-mono font-bold bg-gdp/15 text-gdp border border-gdp/30 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm">
            <TrendingUp size={11} />
            <span>
              {t("efficiencyBonus", {
                pct: formatPercent(bonusPercent),
              })}
            </span>
          </span>
        )}

        <div className="w-7 h-7 rounded-xl bg-secondary/80 border border-border/60 flex items-center justify-center text-amber-400 shrink-0">
          <ShieldCheck size={14} />
        </div>
      </div>
    </div>
  );
}
