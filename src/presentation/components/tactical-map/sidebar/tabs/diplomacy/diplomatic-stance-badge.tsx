import React from "react";
import { CheckCircle2, Handshake, Ban } from "lucide-react";

interface DiplomaticStanceBadgeProps {
  stance: string;
  isTradeEmbargoed?: boolean;
}

export function DiplomaticStanceBadge({
  stance,
  isTradeEmbargoed = false,
}: DiplomaticStanceBadgeProps) {
  if (isTradeEmbargoed) {
    return (
      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-500 text-[9px] font-bold flex items-center gap-1">
        <Ban size={10} /> تحریم تجاری
      </span>
    );
  }

  switch (stance) {
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
