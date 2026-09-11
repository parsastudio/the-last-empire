import React from "react";
import { useTranslations } from "next-intl";
import { Globe2, Users, Building2, Coins } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";

interface BattleSpoilsMetricsGridProps {
  spoils?: BattleFullReportData["spoils"];
}

export function BattleSpoilsMetricsGrid({
  spoils,
}: BattleSpoilsMetricsGridProps) {
  const t = useTranslations("reports.spoils.metrics");

  return (
    <div className="grid grid-cols-2 gap-3 font-mono w-full">
      <div className="bg-card/90 border border-border/80 p-3.5 rounded-2xl space-y-1 shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground text-[11px] font-sans font-bold">
          <span className="flex items-center gap-1">
            <Globe2 size={13} className="text-primary" />
            <span>{t("territoryExtent")}</span>
          </span>
          <span>🗺️</span>
        </div>
        <span className="text-base font-black text-foreground block">
          {t("pixelsUnit", {
            count: PersianNumberFormatter.formatNumberWithCommas(
              spoils?.conqueredPixels || 0,
            ),
          })}
        </span>
        <span className="text-[9px] text-muted-foreground font-sans block">
          {t("provincesUnit", {
            count: PersianNumberFormatter.toPersianDigits(
              spoils?.conqueredProvincesCount || 0,
            ),
          })}
        </span>
      </div>

      <div className="bg-card/90 border border-border/80 p-3.5 rounded-2xl space-y-1 shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground text-[11px] font-sans font-bold">
          <span className="flex items-center gap-1">
            <Users size={13} className="text-primary" />
            <span>{t("populationGained")}</span>
          </span>
          <span>👥</span>
        </div>
        <span className="text-base font-black text-foreground block">
          {t("citizensUnit", {
            count: PersianNumberFormatter.formatCompactNumber(
              spoils?.gainedPopulation || 0,
            ),
          })}
        </span>
        <span className="text-[9px] text-gdp font-sans block">
          {t("workforceGrowth")}
        </span>
      </div>

      <div className="bg-card/90 border border-border/80 p-3.5 rounded-2xl space-y-1 shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground text-[11px] font-sans font-bold">
          <span className="flex items-center gap-1">
            <Building2 size={13} className="text-gdp" />
            <span>{t("gdpGained")}</span>
          </span>
          <span>📈</span>
        </div>
        <span className="text-base font-black text-gdp block">
          +{PersianNumberFormatter.formatCurrency(spoils?.gainedGdp || 0, true)}
        </span>
        <span className="text-[9px] text-muted-foreground font-sans block">
          {t("economicBase")}
        </span>
      </div>

      <div className="bg-card/90 border border-border/80 p-3.5 rounded-2xl space-y-1 shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground text-[11px] font-sans font-bold">
          <span className="flex items-center gap-1">
            <Coins size={13} className="text-treasury" />
            <span>{t("treasuryLooted")}</span>
          </span>
          <span>💰</span>
        </div>
        <span className="text-base font-black text-amber-400 block">
          +
          {PersianNumberFormatter.formatCurrency(
            spoils?.lootedTreasury || 0,
            true,
          )}
        </span>
        <span className="text-[9px] text-muted-foreground font-sans block">
          {t("treasuryDeposit")}
        </span>
      </div>
    </div>
  );
}
