import React from "react";
import { CheckCircle2, Handshake, Ban, Swords, Globe } from "lucide-react";
import { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";

interface DiplomaticStanceBadgeProps {
  stance: DiplomaticStance;
}

export function DiplomaticStanceBadge({ stance }: DiplomaticStanceBadgeProps) {
  if (stance === "WAR") {
    return (
      <span className="px-2 py-0.5 rounded-md bg-rose-600/25 text-rose-500 border border-rose-500/40 text-[9px] font-bold flex items-center gap-1">
        <Swords size={10} /> وضعیت نبرد
      </span>
    );
  }

  if (stance === "SEVERED_RELATIONS") {
    return (
      <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/20 text-[9px] font-bold flex items-center gap-1">
        <Ban size={10} /> قطع روابط تجاری
      </span>
    );
  }

  switch (stance) {
    case "ALLIANCE":
      return (
        <span className="px-2 py-0.5 rounded-md bg-gdp/20 text-gdp border border-gdp/30 text-[9px] font-bold flex items-center gap-1">
          <CheckCircle2 size={10} /> اتحاد کامل
        </span>
      );
    case "NON_AGGRESSION_PACT":
      return (
        <span className="px-2 py-0.5 rounded-md bg-treasury/20 text-treasury border border-treasury/30 text-[9px] font-bold flex items-center gap-1">
          <Handshake size={10} /> عدم تخاصم
        </span>
      );
    case "NORMAL_DIPLOMACY":
    default:
      return (
        <span className="px-2 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border/60 text-[9px] font-bold flex items-center gap-1">
          <Globe size={10} /> دیپلماسی عادی
        </span>
      );
  }
}
