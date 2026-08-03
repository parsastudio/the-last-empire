"use client";

import React, { useMemo } from "react";
import {
  Coins,
  Fuel,
  BrickWall,
  Users,
  Landmark,
  ShieldAlert,
  Globe,
  LucideIcon,
} from "lucide-react";
import { HumanResourceMetrics } from "@/presentation/hooks/game/use-game-resources";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface ResourceBadgeProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  value: string | number;
  subValue?: string;
  subValueColor?: string;
}

function ResourceBadge({
  icon: Icon,
  iconColor,
  label,
  value,
  subValue,
  subValueColor = "text-gdp",
}: ResourceBadgeProps) {
  return (
    <div
      className="flex items-center gap-2 bg-secondary/50 border border-border/70 px-3 py-1.5 rounded-2xl font-mono text-xs transition-all hover:bg-secondary/80 hover:border-border cursor-default shrink-0"
      title={label}
    >
      <Icon size={14} className={`${iconColor} shrink-0`} />
      <div className="flex items-center gap-1.5 leading-none">
        <span className="font-bold text-foreground">{value}</span>
        {subValue && (
          <span className={`text-[10px] font-semibold ${subValueColor}`}>
            ({subValue})
          </span>
        )}
      </div>
    </div>
  );
}

function StabilityMeterBadge({
  stability,
  corruption,
}: {
  stability: number;
  corruption: number;
}) {
  const style = useMemo(() => {
    if (stability >= 70) return { text: "text-gdp", bg: "bg-gdp" };
    if (stability >= 40) return { text: "text-treasury", bg: "bg-treasury" };
    return { text: "text-military", bg: "bg-military" };
  }, [stability]);

  return (
    <div
      className="flex items-center gap-2 bg-secondary/50 border border-border/70 px-3 py-1.5 rounded-2xl font-mono text-xs transition-all hover:bg-secondary/80 cursor-default shrink-0"
      title={`ثبات سیاسی: ${PersianNumberFormatter.toPersianDigits(stability)}% | فساد اداری: ${PersianNumberFormatter.toPersianDigits(corruption)}%`}
    >
      <Landmark size={14} className="text-diplomacy shrink-0" />
      <div className="flex items-center gap-2">
        <span className={`font-bold ${style.text}`}>
          {PersianNumberFormatter.toPersianDigits(stability)}%
        </span>
        <div className="w-12 h-1.5 bg-background/80 rounded-full overflow-hidden border border-border/40">
          <div
            className={`h-full rounded-full transition-all duration-300 ${style.bg}`}
            style={{ width: `${stability}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function ThreatRadarBadge({ globalReputation }: { globalReputation: number }) {
  const isHighThreat = globalReputation <= -30;
  const isPositive = globalReputation > 0;

  return (
    <div
      className={`flex items-center gap-2 border px-3 py-1.5 rounded-2xl font-mono text-xs transition-all cursor-default shrink-0 ${
        isHighThreat
          ? "bg-military/15 border-military/50 text-military"
          : isPositive
            ? "bg-gdp/15 border-gdp/50 text-gdp"
            : "bg-secondary/50 border-border/70 text-muted-foreground"
      }`}
      title="شاخص پرستیژ و جایگاه بین‌المللی کشور"
    >
      {isHighThreat ? (
        <ShieldAlert size={14} className="animate-pulse text-military" />
      ) : (
        <Globe
          size={14}
          className={isPositive ? "text-gdp" : "text-muted-foreground"}
        />
      )}
      <div className="flex items-center gap-1 whitespace-nowrap">
        <span className="text-[10px] font-sans font-medium">
          {isHighThreat ? "خطر ائتلاف:" : "اعتبار:"}
        </span>
        <span className="font-bold">
          {globalReputation > 0 ? "+" : ""}
          {PersianNumberFormatter.toPersianDigits(globalReputation)}
        </span>
      </div>
    </div>
  );
}

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

    const formattedOil = `${PersianNumberFormatter.toPersianDigits(
      metrics.oil.toLocaleString("en-US"),
    )} بلوک`;

    const formattedOilUsage = `${PersianNumberFormatter.toPersianDigits(
      metrics.oilRequiredPerTurn,
    )} مصرف`;

    const formattedSteel = `${PersianNumberFormatter.toPersianDigits(
      metrics.steel.toLocaleString("en-US"),
    )} بلوک`;

    const formattedManpower = PersianNumberFormatter.toPersianDigits(
      metrics.manpower.toLocaleString("en-US"),
    );

    return {
      formattedTreasury,
      formattedIncome,
      formattedOil,
      formattedOilUsage,
      formattedSteel,
      formattedManpower,
      isOilDeficit: metrics.oil < metrics.oilRequiredPerTurn,
    };
  }, [metrics]);

  return (
    <header
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseOver={(e) => e.stopPropagation()}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-card/95 backdrop-blur-2xl border border-border/80 px-4 py-2 rounded-3xl shadow-2xl flex items-center justify-between gap-3 text-foreground select-none w-max max-w-[95vw] dir-rtl transition-all pointer-events-auto"
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
          iconColor={formatted.isOilDeficit ? "text-military" : "text-treasury"}
          label="ذخایر نفت خام و مصرف نوبتی"
          value={formatted.formattedOil}
          subValue={formatted.formattedOilUsage}
          subValueColor={
            formatted.isOilDeficit ? "text-military font-bold" : "text-treasury"
          }
        />

        <ResourceBadge
          icon={BrickWall}
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

        <ThreatRadarBadge
          globalReputation={metrics.nation?.globalReputation ?? 50}
        />
      </div>

      <div className="flex items-center gap-2 shrink-0 border-r border-border/80 pr-3 mr-1">
        <div className="flex flex-col items-center leading-none font-mono px-2.5 py-1 bg-secondary/80 rounded-xl border border-border/80">
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
