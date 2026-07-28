import React from "react";
import { CasualtyMetrics } from "@/domain/reports/combat-report.schema";
import {
  Shield,
  Plane,
  Radio,
  MapPin,
  ShieldAlert,
  RotateCcw,
} from "lucide-react";

interface CasualtyTableProps {
  attackerName: string;
  defenderName: string;
  attackerCasualties: CasualtyMetrics;
  defenderCasualties: CasualtyMetrics;
  conqueredAreaSqKm: number;
}

export function CasualtyTable({
  attackerName,
  defenderName,
  attackerCasualties,
  defenderCasualties,
  conqueredAreaSqKm,
}: CasualtyTableProps) {
  const formattedArea = new Intl.NumberFormat("fa-IR").format(
    Math.round(conqueredAreaSqKm),
  );

  return (
    <div className="bg-secondary/40 border border-border/80 rounded-2xl p-4 space-y-3 font-mono text-xs dir-rtl">
      <div className="grid grid-cols-3 gap-2 pb-2 border-b border-border/60 text-center font-bold font-sans">
        <span className="text-muted-foreground text-[10px] uppercase">
          شاخص نبرد
        </span>
        <span className="text-emerald-500 truncate">{attackerName} (شما)</span>
        <span className="text-rose-500 truncate">{defenderName}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 items-center text-center py-1 border-b border-border/40">
        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] justify-start font-sans">
          <Shield size={13} className="text-primary" />
          <span>تلفات پیاده‌نظام</span>
        </div>
        <span className="font-bold text-foreground">
          {attackerCasualties.infantryLost.toLocaleString("fa-IR")} یگان
        </span>
        <span className="font-bold text-foreground">
          {defenderCasualties.infantryLost.toLocaleString("fa-IR")} یگان
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 items-center text-center py-1 border-b border-border/40">
        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] justify-start font-sans">
          <RotateCcw size={13} className="text-gdp" />
          <span>نیروهای عقب‌نشینی‌کرده</span>
        </div>
        <span className="font-bold text-gdp">
          {(attackerCasualties.infantryRetreated || 0).toLocaleString("fa-IR")}{" "}
          یگان
        </span>
        <span className="font-bold text-gdp">
          {(defenderCasualties.infantryRetreated || 0).toLocaleString("fa-IR")}{" "}
          یگان
        </span>
      </div>

      {defenderCasualties.militiaGarrisonPower !== undefined && (
        <div className="grid grid-cols-3 gap-2 items-center text-center py-1 border-b border-border/40">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] justify-start font-sans">
            <ShieldAlert size={13} className="text-treasury" />
            <span>پادگان و میلیشیای وطن</span>
          </div>
          <span className="text-muted-foreground text-[10px]">-</span>
          <span className="font-bold text-treasury">
            {defenderCasualties.militiaGarrisonPower.toLocaleString("fa-IR")}{" "}
            یگان
          </span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 items-center text-center py-1 border-b border-border/40">
        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] justify-start font-sans">
          <Plane size={13} className="text-gdp" />
          <span>انحدام جنگنده‌ها</span>
        </div>
        <span className="font-bold text-foreground">
          {attackerCasualties.airForceLost.toLocaleString("fa-IR")} فروند
        </span>
        <span className="font-bold text-foreground">
          {defenderCasualties.airForceLost.toLocaleString("fa-IR")} فروند
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 items-center text-center py-1 border-b border-border/40">
        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] justify-start font-sans">
          <Radio size={13} className="text-treasury" />
          <span>رهگیری موشک/پهپاد</span>
        </div>
        <span className="font-bold text-foreground">
          {attackerCasualties.droneMissileLost.toLocaleString("fa-IR")} یگان
        </span>
        <span className="font-bold text-foreground">
          {defenderCasualties.droneMissileLost.toLocaleString("fa-IR")} یگان
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 items-center text-center pt-1">
        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] justify-start font-sans">
          <MapPin size={13} className="text-military" />
          <span>مساحت تصرف‌شده</span>
        </div>
        <span className="font-bold text-gdp col-span-2 text-right dir-rtl">
          +{formattedArea} km²
        </span>
      </div>
    </div>
  );
}
