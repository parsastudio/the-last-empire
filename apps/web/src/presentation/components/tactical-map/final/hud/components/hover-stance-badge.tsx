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
import {
  getDiplomaticStanceLabel,
  getDiplomaticStanceBadgeClass,
} from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/utils/relation-appearance.utility";

interface HoverStanceBadgeProps {
  isOwnCountry: boolean;
  hasSecurityGuarantee?: boolean;
  rawStance?: DiplomaticStance;
}

export function HoverStanceBadge({
  isOwnCountry,
  hasSecurityGuarantee = false,
  rawStance = "NORMAL_DIPLOMACY",
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

  const badgeClass = getDiplomaticStanceBadgeClass(rawStance);
  const label = getDiplomaticStanceLabel(rawStance);

  switch (rawStance) {
    case "WAR":
      return (
        <span
          className={`flex items-center gap-1 text-[10px] font-bold font-sans px-2 py-0.5 rounded-lg shadow-sm animate-pulse ${badgeClass}`}
        >
          <Swords size={11} />
          <span>{label}</span>
        </span>
      );
    case "STRATEGIC_PARTNERSHIP":
      return (
        <span
          className={`flex items-center gap-1 text-[10px] font-bold font-sans px-2 py-0.5 rounded-lg shadow-sm ${badgeClass}`}
        >
          <CheckCircle2 size={11} />
          <span>{label}</span>
        </span>
      );
    case "NON_AGGRESSION_PACT":
      return (
        <span
          className={`flex items-center gap-1 text-[10px] font-bold font-sans px-2 py-0.5 rounded-lg shadow-sm ${badgeClass}`}
        >
          <Handshake size={11} />
          <span>{label}</span>
        </span>
      );
    case "NORMAL_DIPLOMACY":
    default:
      return (
        <span
          className={`flex items-center gap-1 text-[10px] font-bold font-sans px-2 py-0.5 rounded-lg shadow-sm ${badgeClass}`}
        >
          <Globe size={11} />
          <span>{label}</span>
        </span>
      );
  }
}
