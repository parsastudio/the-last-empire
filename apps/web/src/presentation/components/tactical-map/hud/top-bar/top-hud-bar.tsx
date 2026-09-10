"use client";

import React, { useMemo, useState } from "react";
import { Coins, Volume2, VolumeX } from "lucide-react";
import { HumanResourceMetrics } from "@/presentation/selectors/resource-metrics.selector";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { ResourceBadge } from "@/presentation/components/tactical-map/hud/top-bar/components/resource-badge";
import { CapacityMeterBadge } from "@/presentation/components/tactical-map/hud/top-bar/components/capacity-meter-badge";
import { StabilityMeterBadge } from "@/presentation/components/tactical-map/hud/top-bar/components/stability-meter-badge";
import { ThreatRadarBadge } from "@/presentation/components/tactical-map/hud/top-bar/components/threat-radar-badge";
import { TacticalSound } from "@/presentation/utils/tactical-sound";

interface TopHudBarProps {
  metrics: HumanResourceMetrics;
}

export function TopHudBar({ metrics }: TopHudBarProps) {
  const [isMuted, setIsMuted] = useState<boolean>(() =>
    TacticalSound.isMuted(),
  );

  const handleToggleMute = () => {
    const nextMuted = TacticalSound.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      TacticalSound.playUiClick();
    }
  };

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
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-card/90 backdrop-blur-3xl border border-border/80 px-4 py-2 rounded-3xl shadow-2xl shadow-black/80 flex items-center justify-between gap-3 text-foreground select-none w-max max-w-[95vw] dir-rtl transition-all pointer-events-auto ring-1 ring-white/10"
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
          totalActiveFactories={metrics.totalActiveFactories}
          totalMaxSlots={metrics.totalMaxSlots}
        />

        <div className="w-[1px] h-6 bg-gradient-to-b from-transparent via-border to-transparent shrink-0 hidden sm:block" />

        <StabilityMeterBadge stability={metrics.stability} />

        <ThreatRadarBadge
          globalReputation={metrics.nation?.globalReputation ?? 50}
        />
      </div>

      <div className="flex items-center gap-2 shrink-0 border-r border-border/80 pr-3 mr-1">
        <button
          type="button"
          onClick={handleToggleMute}
          className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
            isMuted
              ? "bg-rose-500/15 border-rose-500/40 text-rose-400 hover:bg-rose-500/25"
              : "bg-secondary/80 border-border/70 text-muted-foreground hover:text-foreground hover:bg-secondary shadow-inner"
          }`}
          title={isMuted ? "فعال‌سازی صدای بازی" : "قطع صدای بازی"}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        <div className="flex flex-col items-center leading-none font-mono px-3 py-1 bg-secondary/80 rounded-xl border border-border/70 shadow-inner">
          <span className="text-[9px] text-muted-foreground font-sans font-bold">
            نوبت
          </span>
          <span className="text-xs font-black text-foreground">
            {PersianNumberFormatter.toPersianDigits(metrics.currentTurn)}
          </span>
        </div>
      </div>
    </header>
  );
}
