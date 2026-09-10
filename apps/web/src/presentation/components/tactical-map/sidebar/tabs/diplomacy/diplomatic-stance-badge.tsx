import React from "react";
import {
  CheckCircle2,
  Handshake,
  Swords,
  Globe,
  Compass,
  ShieldCheck,
  Skull,
  Crown,
} from "lucide-react";
import { DiplomaticStance, DiplomaticPosture } from "@geopolitics/domain";
import {
  getPostureLabel,
  getPostureBadgeClass,
  getDiplomaticStanceLabel,
  getDiplomaticStanceBadgeClass,
} from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/utils/relation-appearance.utility";

interface DiplomaticStanceBadgeProps {
  stance: DiplomaticStance | string;
  posture?: DiplomaticPosture;
  hasSecurityGuarantee?: boolean;
  isEmergencyProtectorate?: boolean;
  isOwnCountry?: boolean;
}

export function DiplomaticStanceBadge({
  stance,
  posture,
  hasSecurityGuarantee = false,
  isEmergencyProtectorate = false,
  isOwnCountry = false,
}: DiplomaticStanceBadgeProps) {
  if (isOwnCountry) {
    return (
      <span className="flex items-center gap-1 text-[9px] font-bold font-sans bg-gdp/15 text-gdp border border-gdp/30 px-2 py-0.5 rounded-md shadow-sm">
        <Crown size={11} />
        <span>امپراتوری شما</span>
      </span>
    );
  }

  if (isEmergencyProtectorate) {
    return (
      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[9px] font-bold flex items-center gap-1 font-sans shadow-sm">
        <Skull size={10} />
        <span>تحت استمداد ابرقدرت</span>
      </span>
    );
  }

  if (hasSecurityGuarantee) {
    return (
      <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[9px] font-bold flex items-center gap-1 font-sans shadow-sm">
        <ShieldCheck size={10} />
        <span>پیمان دفاعی متقابل</span>
      </span>
    );
  }

  const badgeClass = getDiplomaticStanceBadgeClass(stance);
  const label = getDiplomaticStanceLabel(stance);

  if (stance === "WAR") {
    return (
      <span
        className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 font-sans shadow-sm animate-pulse ${badgeClass}`}
      >
        <Swords size={10} />
        <span>{label}</span>
      </span>
    );
  }

  if (stance === "STRATEGIC_PARTNERSHIP") {
    return (
      <span
        className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 font-sans shadow-sm ${badgeClass}`}
      >
        <CheckCircle2 size={10} />
        <span>{label}</span>
      </span>
    );
  }

  if (stance === "NON_AGGRESSION_PACT") {
    return (
      <span
        className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 font-sans shadow-sm ${badgeClass}`}
      >
        <Handshake size={10} />
        <span>{label}</span>
      </span>
    );
  }

  if (posture && posture !== "NEUTRAL_COEXISTENCE") {
    return (
      <span
        className={`px-2 py-0.5 rounded-md border text-[9px] font-bold flex items-center gap-1 font-sans shadow-sm ${getPostureBadgeClass(
          posture,
        )}`}
      >
        <Compass size={10} />
        <span>{getPostureLabel(posture)}</span>
      </span>
    );
  }

  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 font-sans shadow-sm ${badgeClass}`}
    >
      <Globe size={10} />
      <span>{label}</span>
    </span>
  );
}
