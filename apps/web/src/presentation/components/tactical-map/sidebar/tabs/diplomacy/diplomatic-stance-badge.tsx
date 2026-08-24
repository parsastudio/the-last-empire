import React from "react";
import { CheckCircle2, Handshake, Swords, Globe, Compass } from "lucide-react";
import { DiplomaticStance, DiplomaticPosture } from "@geopolitics/domain";
import {
  getPostureLabel,
  getPostureBadgeClass,
} from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/utils/relation-resolver";

interface DiplomaticStanceBadgeProps {
  stance: DiplomaticStance;
  posture?: DiplomaticPosture;
}

export function DiplomaticStanceBadge({
  stance,
  posture,
}: DiplomaticStanceBadgeProps) {
  if (stance === "WAR") {
    return (
      <span className="px-2 py-0.5 rounded-md bg-rose-600/25 text-rose-500 border border-rose-500/40 text-[9px] font-bold flex items-center gap-1 font-sans">
        <Swords size={10} /> وضعیت نبرد
      </span>
    );
  }

  if (stance === "ALLIANCE") {
    return (
      <span className="px-2 py-0.5 rounded-md bg-gdp/20 text-gdp border border-gdp/30 text-[9px] font-bold flex items-center gap-1 font-sans">
        <CheckCircle2 size={10} /> اتحاد کامل
      </span>
    );
  }

  if (stance === "NON_AGGRESSION_PACT") {
    return (
      <span className="px-2 py-0.5 rounded-md bg-treasury/20 text-treasury border border-treasury/30 text-[9px] font-bold flex items-center gap-1 font-sans">
        <Handshake size={10} /> عدم تخاصم
      </span>
    );
  }

  if (posture && posture !== "NEUTRAL_COEXISTENCE") {
    return (
      <span
        className={`px-2 py-0.5 rounded-md border text-[9px] font-bold flex items-center gap-1 font-sans ${getPostureBadgeClass(
          posture,
        )}`}
      >
        <Compass size={10} />
        <span>{getPostureLabel(posture)}</span>
      </span>
    );
  }

  return (
    <span className="px-2 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border/60 text-[9px] font-bold flex items-center gap-1 font-sans">
      <Globe size={10} /> دیپلماسی عادی
    </span>
  );
}
