"use client";

import React, { useState } from "react";
import { Coins, Fuel, Wrench, Users, Bell } from "lucide-react";
import { HumanResourceMetrics } from "@/presentation/hooks/game/use-game-resources";
import { ResourceBadge } from "./resource-badge";
import { StabilityMeterBadge } from "./stability-meter-badge";
import { ThreatRadarBadge } from "./threat-radar-badge";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { PendingDecisionsModal } from "./pending-decisions-modal";
import { useTopHudMetrics } from "./hooks/use-top-hud-metrics";

interface TopHudBarProps {
  metrics: HumanResourceMetrics;
  onOpenPending?: (tab?: string) => void;
}

export function TopHudBar({ metrics, onOpenPending }: TopHudBarProps) {
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const formatted = useTopHudMetrics(metrics);

  const handleOpenPending = () => {
    setIsPendingModalOpen(true);
  };

  const handleNavigateFromPending = (tab: string) => {
    if (onOpenPending) {
      onOpenPending(tab);
    }
  };

  return (
    <>
      <header
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-card/85 backdrop-blur-xl border border-border/80 px-4 py-2 rounded-3xl shadow-2xl flex items-center justify-between gap-3 text-foreground select-none w-max max-w-[95vw] dir-rtl transition-all pointer-events-auto"
        dir="rtl"
      >
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 shrink-0">
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

          <ResourceBadge
            icon={Fuel}
            iconColor={
              formatted.isOilDeficit ? "text-military" : "text-treasury"
            }
            label="ذخایر نفت خام و مصرف نوبتی"
            value={formatted.formattedOil}
            subValue={formatted.formattedOilUsage}
            subValueColor={
              formatted.isOilDeficit
                ? "text-military font-bold"
                : "text-treasury"
            }
          />

          <ResourceBadge
            icon={Wrench}
            iconColor="text-primary"
            label="ذخایر فولاد صنعتی"
            value={formatted.formattedSteel}
          />

          <ResourceBadge
            icon={Users}
            iconColor="text-primary"
            label="نیروی انسانی آماده"
            value={formatted.formattedManpower}
          />

          <div className="w-[1px] h-6 bg-border/80 shrink-0 hidden sm:block" />

          <StabilityMeterBadge
            stability={metrics.stability}
            corruption={metrics.corruption}
          />

          <ThreatRadarBadge globalAggression={metrics.globalAggression} />
        </div>

        <div className="flex items-center gap-2 shrink-0 border-r border-border/80 pr-3 mr-1">
          {metrics.pendingDecisionsCount > 0 && (
            <button
              onClick={handleOpenPending}
              className="relative flex items-center justify-center p-1.5 rounded-xl bg-treasury/15 text-treasury border border-treasury/30 animate-pulse cursor-pointer transition-transform active:scale-95"
              title={`${metrics.pendingDecisionsCount} تصمیم معوق نیازمند اقدام`}
            >
              <Bell size={14} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-treasury text-primary-foreground rounded-full text-[9px] font-mono font-bold flex items-center justify-center">
                {PersianNumberFormatter.toPersianDigits(
                  metrics.pendingDecisionsCount,
                )}
              </span>
            </button>
          )}

          <div className="flex flex-col items-center leading-none font-mono px-2 py-1 bg-secondary/60 rounded-xl border border-border/60">
            <span className="text-[9px] text-muted-foreground font-sans">
              نوبت
            </span>
            <span className="text-xs font-bold text-foreground">
              {PersianNumberFormatter.toPersianDigits(metrics.currentTurn)}
            </span>
          </div>
        </div>
      </header>

      <PendingDecisionsModal
        isOpen={isPendingModalOpen}
        metrics={metrics}
        onClose={() => setIsPendingModalOpen(false)}
        onNavigateTab={handleNavigateFromPending}
      />
    </>
  );
}
