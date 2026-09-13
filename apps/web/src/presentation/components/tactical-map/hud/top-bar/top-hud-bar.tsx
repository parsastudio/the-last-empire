"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Coins, Volume2, VolumeX } from "lucide-react";
import { HumanResourceMetrics } from "@/presentation/selectors/resource-metrics.selector";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";
import { ResourceBadge } from "@/presentation/components/tactical-map/hud/top-bar/components/resource-badge";
import { CapacityMeterBadge } from "@/presentation/components/tactical-map/hud/top-bar/components/capacity-meter-badge";
import { StabilityMeterBadge } from "@/presentation/components/tactical-map/hud/top-bar/components/stability-meter-badge";
import { ThreatRadarBadge } from "@/presentation/components/tactical-map/hud/top-bar/components/threat-radar-badge";
import { LanguageSwitcher } from "@/presentation/components/common/language-switcher";
import { TacticalSound } from "@/presentation/utils/tactical-sound";

interface TopHudBarProps {
  metrics: HumanResourceMetrics;
}

export function TopHudBar({ metrics }: TopHudBarProps) {
  const t = useTranslations("hud.topBar");
  const { formatCurrency, formatSignedIncome, toDigits } = useLocaleFormatter();
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    setIsMuted(TacticalSound.isMuted());
  }, []);

  const handleToggleMute = () => {
    const nextMuted = TacticalSound.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      TacticalSound.playUiClick();
    }
  };

  const formatted = useMemo(() => {
    const formattedTreasury = formatCurrency(metrics.treasury, true);
    const formattedIncome = formatSignedIncome(metrics.netIncomePerTurn, true);

    return {
      formattedTreasury,
      formattedIncome,
    };
  }, [metrics, formatCurrency, formatSignedIncome]);

  return (
    <header
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseOver={(e) => e.stopPropagation()}
      style={{
        top: "max(0.5rem, env(safe-area-inset-top))",
      }}
      className="fixed left-1/2 -translate-x-1/2 z-50 bg-card/90 backdrop-blur-3xl border border-border/80 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl md:rounded-3xl shadow-2xl shadow-black/80 flex items-center justify-between gap-2 md:gap-3 text-foreground select-none w-max max-w-[96vw] transition-all pointer-events-auto ring-1 ring-white/10"
    >
      <div className="flex items-center gap-1.5 md:gap-2.5 overflow-x-auto scrollbar-none py-0.5 shrink-0">
        <ResourceBadge
          icon={Coins}
          iconColor="text-gdp"
          label={t("treasuryTooltip")}
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

        <div className="w-[1px] h-5 md:h-6 bg-gradient-to-b from-transparent via-border to-transparent shrink-0 hidden sm:block" />

        <StabilityMeterBadge stability={metrics.stability} />

        <ThreatRadarBadge
          globalReputation={metrics.nation?.globalReputation ?? 50}
        />
      </div>

      <div className="flex items-center gap-1.5 md:gap-2 shrink-0 border-s border-border/80 ps-2 md:ps-3 ms-0.5 md:ms-1">
        <LanguageSwitcher />

        <button
          type="button"
          onClick={handleToggleMute}
          className={`p-1.5 md:p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
            isMuted
              ? "bg-rose-500/15 border-rose-500/40 text-rose-400 hover:bg-rose-500/25"
              : "bg-secondary/80 border-border/70 text-muted-foreground hover:text-foreground hover:bg-secondary shadow-inner"
          }`}
          title={isMuted ? t("enableSound") : t("muteSound")}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>

        <div className="flex flex-col items-center leading-none font-mono px-2.5 py-0.5 md:px-3 md:py-1 bg-secondary/80 rounded-xl border border-border/70 shadow-inner">
          <span className="text-[8px] md:text-[9px] text-muted-foreground font-sans font-bold">
            {t("turnLabel")}
          </span>
          <span className="text-[11px] md:text-xs font-black text-foreground">
            {toDigits(metrics.currentTurn)}
          </span>
        </div>
      </div>
    </header>
  );
}
