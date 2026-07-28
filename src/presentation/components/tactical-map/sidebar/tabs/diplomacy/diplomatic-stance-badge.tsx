import React from "react";
import { Swords, CheckCircle2, Handshake } from "lucide-react";

interface DiplomaticStanceBadgeProps {
  stance: string;
}

export function DiplomaticStanceBadge({ stance }: DiplomaticStanceBadgeProps) {
  switch (stance) {
    case "WAR":
      return (
        <span className="px-2 py-0.5 rounded-md bg-military/20 text-military text-[9px] font-bold flex items-center gap-1">
          <Swords size={10} /> در حال جنگ
        </span>
      );
    case "ALLIANCE":
      return (
        <span className="px-2 py-0.5 rounded-md bg-gdp/20 text-gdp text-[9px] font-bold flex items-center gap-1">
          <CheckCircle2 size={10} /> اتحاد کامل
        </span>
      );
    case "NON_AGGRESSION_PACT":
      return (
        <span className="px-2 py-0.5 rounded-md bg-treasury/20 text-treasury text-[9px] font-bold flex items-center gap-1">
          <Handshake size={10} /> عدم تخاصم
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded-md bg-secondary text-muted-foreground text-[9px] font-bold">
          صلح و آرام
        </span>
      );
  }
}
