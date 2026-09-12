import React from "react";
import { useTranslations } from "next-intl";
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
    <div className="bg-background/50 border border-border/70 p-3 rounded-2xl flex items-center justify-between text-start font-sans">
      <span className="text-[10px] text-muted-foreground font-sans font-bold">
        {t("readinessTitle")}
      </span>
      <span className="text-xs font-bold text-amber-500 font-mono">
        {t("techLevelBadge", {
          level: formatLevel(techLevel),
        })}{" "}
        {bonusPercent > 0 && (
          <span className="text-[10px] text-gdp font-mono">
            {t("efficiencyBonus", {
              pct: formatPercent(bonusPercent),
            })}
          </span>
        )}
      </span>
    </div>
  );
}
