"use client";

import React, { useMemo } from "react";
import { Coins } from "lucide-react";
import { HumanResourceMetrics } from "@/presentation/selectors/resource-metrics.selector";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { ResourceBadge } from "./components/resource-badge";
import { CapacityMeterBadge } from "./components/capacity-meter-badge";
import { StabilityMeterBadge } from "./components/stability-meter-badge";
import { ThreatRadarBadge } from "./components/threat-radar-badge";

interface TopHudBarProps {
  metrics: HumanResourceMetrics;
}

export function TopHudBar({ metrics }: TopHudBarProps) {
  const formatted = useMemo(() => {
    const formattedTreasury = PersianNumberFormatter.formatCurrency(
      metrics.treasury,
      true,
    );
    const formattedIncome = PersianNumberFormatter.formatSignedIncome(
      metrics.netIncomePerTurn,
    );

    return {
      formattedTreasury,
      formattedIncome,
    };
  }, [metrics]);

  return (
    <header
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseOver={(e) => e.stopPropagation()}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-card/95 backdrop-blur-2xl border border-border/80 px-4 py-2 rounded-3xl shadow-2xl shadow-black/60 flex items-center justify-between gap-3 text-foreground select-none w-max max-w-[95vw] dir-rtl transition-all pointer-events-auto ring-1 ring-white/5"
      dir="rtl"
    >
      <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-0.5 shrink-0">
        <ResourceBadge
          icon={Coins}
          iconColor="text-gdp"
          label="خزانه ملی و سود نوبتی"
          value={formatted.formattedTreasury}
          subValue={formatted.formattedIncome}
          subValueColor={
            metrics.netIncomePerTurn >= 0 ? "text-gdp" : "text-military"
          }
        />

        <CapacityMeterBadge
          capacityPct={metrics.capacityPercentage}
          population={metrics.population}
        />

        <div className="w-[1px] h-6 bg-border/80 shrink-0 hidden sm:block" />

        <StabilityMeterBadge stability={metrics.stability} />

        <ThreatRadarBadge
          globalReputation={metrics.nation?.globalReputation ?? 50}
        />
      </div>

      <div className="flex items-center gap-2 shrink-0 border-r border-border/80 pr-3 mr-1">
        <div className="flex flex-col items-center leading-none font-mono px-3 py-1 bg-secondary/80 rounded-xl border border-border">
          <span className="text-[9px] text-muted-foreground font-sans">
            نوبت
          </span>
          <span className="text-xs font-bold text-foreground">
            {PersianNumberFormatter.toPersianDigits(metrics.currentTurn)}
          </span>
        </div>
      </div>
    </header>
  );
}
