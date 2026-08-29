import React from "react";
import {
  Crown,
  ShieldCheck,
  Swords,
  CheckCircle2,
  Handshake,
  Globe,
} from "lucide-react";
import { DiplomaticStance } from "@geopolitics/domain";

interface HoverStanceBadgeProps {
  isOwnCountry: boolean;
  hasSecurityGuarantee?: boolean;
  rawStance?: DiplomaticStance;
}

export function HoverStanceBadge({
  isOwnCountry,
  hasSecurityGuarantee = false,
  rawStance,
}: HoverStanceBadgeProps) {
  if (isOwnCountry) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold font-sans bg-gdp/15 text-gdp border border-gdp/30 px-2 py-0.5 rounded-lg shadow-sm">
        <Crown size={11} />
        <span>امپراتوری شما</span>
      </span>
    );
  }

  if (hasSecurityGuarantee) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold font-sans bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 px-2 py-0.5 rounded-lg shadow-sm">
        <ShieldCheck size={11} />
        <span>چتر امنیتی</span>
      </span>
    );
  }

  switch (rawStance) {
    case "WAR":
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold font-sans bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded-lg shadow-sm animate-pulse">
          <Swords size={11} />
          <span>وضعیت نبرد</span>
        </span>
      );
    case "STRATEGIC_PARTNERSHIP":
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold font-sans bg-gdp/20 text-gdp border border-gdp/35 px-2 py-0.5 rounded-lg shadow-sm">
          <CheckCircle2 size={11} />
          <span>شراکت استراتژیک</span>
        </span>
      );
    case "NON_AGGRESSION_PACT":
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold font-sans bg-amber-500/20 text-amber-400 border border-amber-500/35 px-2 py-0.5 rounded-lg shadow-sm">
          <Handshake size={11} />
          <span>عدم تخاصم</span>
        </span>
      );
    case "NORMAL_DIPLOMACY":
    default:
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold font-sans bg-secondary/80 text-muted-foreground border border-border/70 px-2 py-0.5 rounded-lg shadow-sm">
          <Globe size={11} />
          <span>دیپلماسی عادی</span>
        </span>
      );
  }
}
