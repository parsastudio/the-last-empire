"use client";

import React from "react";
import { Coins, Fuel, Wrench, Users, Bell } from "lucide-react";
import { HumanResourceMetrics } from "@/presentation/hooks/game/use-game-resources";
import { ResourceBadge } from "./resource-badge";
import { StabilityMeterBadge } from "./stability-meter-badge";
import { ThreatRadarBadge } from "./threat-radar-badge";

interface TopHudBarProps {
  metrics: HumanResourceMetrics;
  onOpenPending?: () => void;
}

export function TopHudBar({ metrics, onOpenPending }: TopHudBarProps) {
  const formattedTreasury = `$${(metrics.treasury / 1000).toFixed(0)}k`;
  const formattedIncome =
    metrics.netIncomePerTurn >= 0
      ? `+$${(metrics.netIncomePerTurn / 1000).toFixed(0)}k`
      : `-$${(Math.abs(metrics.netIncomePerTurn) / 1000).toFixed(0)}k`;

  const isOilDeficit = metrics.oil < metrics.oilRequiredPerTurn;

  return (
    <header
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-card/85 backdrop-blur-xl border border-border/80 px-4 py-2 rounded-3xl shadow-2xl flex items-center justify-between gap-3 text-foreground select-none max-w-5xl w-[92vw] md:w-auto dir-rtl transition-all pointer-events-auto"
      dir="rtl"
    >
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
        <ResourceBadge
          icon={Coins}
          iconColor="text-gdp"
          label="خزانه ملی و سود نوبتی"
          value={formattedTreasury}
          subValue={formattedIncome}
          subValueColor={
            metrics.netIncomePerTurn >= 0 ? "text-gdp" : "text-military"
          }
        />

        <ResourceBadge
          icon={Fuel}
          iconColor={isOilDeficit ? "text-military" : "text-treasury"}
          label="ذخایر نفت خام و مصرف نوبتی"
          value={`${metrics.oil.toLocaleString("fa-IR")}`}
          subValue={`-${metrics.oilRequiredPerTurn}/نوبت`}
          subValueColor={isOilDeficit ? "text-military" : "text-treasury"}
        />

        <ResourceBadge
          icon={Wrench}
          iconColor="text-primary"
          label="ذخایر فولاد صنعتی"
          value={`${metrics.steel.toLocaleString("fa-IR")}`}
        />

        <ResourceBadge
          icon={Users}
          iconColor="text-primary"
          label="نیروی انسانی آماده"
          value={`${metrics.manpower.toLocaleString("fa-IR")}`}
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
            onClick={onOpenPending}
            className="relative flex items-center justify-center p-1.5 rounded-xl bg-treasury/15 text-treasury border border-treasury/30 animate-pulse cursor-pointer transition-transform active:scale-95"
            title={`${metrics.pendingDecisionsCount} تصمیم معوق نیازمند اقدام`}
          >
            <Bell size={14} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-treasury text-primary-foreground rounded-full text-[9px] font-mono font-bold flex items-center justify-center">
              {metrics.pendingDecisionsCount}
            </span>
          </button>
        )}

        <div className="flex flex-col items-center leading-none font-mono px-2 py-1 bg-secondary/60 rounded-xl border border-border/60">
          <span className="text-[9px] text-muted-foreground font-sans">
            نوبت
          </span>
          <span className="text-xs font-bold text-foreground">
            {metrics.currentTurn}
          </span>
        </div>
      </div>
    </header>
  );
}
