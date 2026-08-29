import React from "react";
import { Globe2, Users, Building2, Coins } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";

interface BattleSpoilsMetricsGridProps {
  spoils?: BattleFullReportData["spoils"];
}

export function BattleSpoilsMetricsGrid({
  spoils,
}: BattleSpoilsMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 font-mono w-full">
      <div className="bg-card/90 border border-border/80 p-3.5 rounded-2xl space-y-1 shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground text-[11px] font-sans font-bold">
          <span className="flex items-center gap-1">
            <Globe2 size={13} className="text-primary" />
            <span>مساحت خاک:</span>
          </span>
          <span>🗺️</span>
        </div>
        <span className="text-base font-black text-foreground block">
          {PersianNumberFormatter.formatNumberWithCommas(
            spoils?.conqueredPixels || 0,
          )}{" "}
          پیکسل
        </span>
        <span className="text-[9px] text-muted-foreground font-sans block">
          {PersianNumberFormatter.toPersianDigits(
            spoils?.conqueredProvincesCount || 0,
          )}{" "}
          استان
        </span>
      </div>

      <div className="bg-card/90 border border-border/80 p-3.5 rounded-2xl space-y-1 shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground text-[11px] font-sans font-bold">
          <span className="flex items-center gap-1">
            <Users size={13} className="text-primary" />
            <span>جمعیت افزوده:</span>
          </span>
          <span>👥</span>
        </div>
        <span className="text-base font-black text-foreground block">
          {PersianNumberFormatter.formatCompactNumber(
            spoils?.gainedPopulation || 0,
          )}{" "}
          نفر
        </span>
        <span className="text-[9px] text-gdp font-sans block">
          رشد نیروی کار
        </span>
      </div>

      <div className="bg-card/90 border border-border/80 p-3.5 rounded-2xl space-y-1 shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground text-[11px] font-sans font-bold">
          <span className="flex items-center gap-1">
            <Building2 size={13} className="text-gdp" />
            <span>GDP افزوده:</span>
          </span>
          <span>📈</span>
        </div>
        <span className="text-base font-black text-gdp block">
          +{PersianNumberFormatter.formatCurrency(spoils?.gainedGdp || 0, true)}
        </span>
        <span className="text-[9px] text-muted-foreground font-sans block">
          پایه اقتصادی
        </span>
      </div>

      <div className="bg-card/90 border border-border/80 p-3.5 rounded-2xl space-y-1 shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground text-[11px] font-sans font-bold">
          <span className="flex items-center gap-1">
            <Coins size={13} className="text-treasury" />
            <span>غارت خزانه:</span>
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
          واریز به خزانه
        </span>
      </div>
    </div>
  );
}
