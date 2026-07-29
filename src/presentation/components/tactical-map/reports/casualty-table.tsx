import React from "react";
import { CasualtyMetrics } from "@/domain/reports/combat-report.schema";
import { Shield, Plane, Radio, MapPin } from "lucide-react";
import { CasualtyRow } from "./casualty-row";

interface CasualtyTableProps {
  attackerName: string;
  defenderName: string;
  attackerCasualties: CasualtyMetrics;
  defenderCasualties: CasualtyMetrics;
  conqueredAreaSqKm: number;
  attackerNationId?: string;
  defenderNationId?: string;
  humanNationId?: string;
}

export function CasualtyTable({
  attackerName,
  defenderName,
  attackerCasualties,
  defenderCasualties,
  conqueredAreaSqKm,
  attackerNationId,
  defenderNationId,
  humanNationId,
}: CasualtyTableProps) {
  const formattedArea = conqueredAreaSqKm.toLocaleString("fa-IR");

  const isAttackerHuman = attackerNationId === humanNationId;
  const isDefenderHuman = defenderNationId === humanNationId;

  const displayAttacker = isAttackerHuman
    ? `${attackerName} (شما)`
    : attackerName;
  const displayDefender = isDefenderHuman
    ? `${defenderName} (شما)`
    : defenderName;

  return (
    <div className="bg-secondary/40 border border-border/80 rounded-2xl p-4 space-y-3 font-mono text-xs dir-rtl text-right">
      <div className="grid grid-cols-3 gap-2 pb-2 border-b border-border/60 text-center font-bold font-sans">
        <span className="text-muted-foreground text-[10px] uppercase">
          تفکیک تلفات یگان‌ها
        </span>
        <span className="text-emerald-500 truncate">{displayAttacker}</span>
        <span className="text-rose-500 truncate">{displayDefender}</span>
      </div>

      <CasualtyRow
        icon={Shield}
        iconColor="text-primary"
        label="تلفات پیاده‌نظام"
        attackerValue={`${attackerCasualties.infantryLost.toLocaleString("fa-IR")} یگان`}
        defenderValue={`${defenderCasualties.infantryLost.toLocaleString("fa-IR")} یگان`}
      />

      <CasualtyRow
        icon={Plane}
        iconColor="text-gdp"
        label="انحدام جنگنده‌ها"
        attackerValue={`${attackerCasualties.airForceLost.toLocaleString("fa-IR")} فروند`}
        defenderValue={`${defenderCasualties.airForceLost.toLocaleString("fa-IR")} فروند`}
      />

      <CasualtyRow
        icon={Radio}
        iconColor="text-treasury"
        label="تلفات پهپاد و موشک"
        attackerValue={`${attackerCasualties.droneMissileLost.toLocaleString("fa-IR")} یگان`}
        defenderValue={`${defenderCasualties.droneMissileLost.toLocaleString("fa-IR")} یگان`}
      />

      <div className="grid grid-cols-3 gap-2 items-center text-center pt-2 border-t border-border/40 font-sans">
        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] justify-start">
          <MapPin size={13} className="text-military" />
          <span>مساحت تصرف‌شده</span>
        </div>
        <span className="font-bold text-gdp col-span-2 text-right dir-rtl font-mono">
          +{formattedArea} km²
        </span>
      </div>
    </div>
  );
}
