import React from "react";
import {
  CheckCircle2,
  Handshake,
  Swords,
  Globe,
  Compass,
  ShieldCheck,
  Skull,
} from "lucide-react";
import { DiplomaticStance, DiplomaticPosture } from "@geopolitics/domain";
import {
  getPostureLabel,
  getPostureBadgeClass,
  getDiplomaticStanceLabel,
  getDiplomaticStanceBadgeClass,
} from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/utils/relation-appearance.utility";

interface DiplomaticStanceBadgeProps {
  stance: DiplomaticStance;
  posture?: DiplomaticPosture;
  hasSecurityGuarantee?: boolean;
  isEmergencyProtectorate?: boolean;
}

export function DiplomaticStanceBadge({
  stance,
  posture,
  hasSecurityGuarantee = false,
  isEmergencyProtectorate = false,
}: DiplomaticStanceBadgeProps) {
  if (isEmergencyProtectorate) {
    return (
      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[9px] font-bold flex items-center gap-1 font-sans">
        <Skull size={10} /> تحت‌الحمایگی استعماری
      </span>
    );
  }

  if (hasSecurityGuarantee) {
    return (
      <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[9px] font-bold flex items-center gap-1 font-sans">
        <ShieldCheck size={10} /> پیمان دفاعی متقابل
      </span>
    );
  }

  if (stance === "WAR") {
    return (
      <span
        className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 font-sans ${getDiplomaticStanceBadgeClass(stance)}`}
      >
        <Swords size={10} /> {getDiplomaticStanceLabel(stance)}
      </span>
    );
  }

  if (stance === "STRATEGIC_PARTNERSHIP") {
    return (
      <span
        className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 font-sans ${getDiplomaticStanceBadgeClass(stance)}`}
      >
        <CheckCircle2 size={10} /> {getDiplomaticStanceLabel(stance)}
      </span>
    );
  }

  if (stance === "NON_AGGRESSION_PACT") {
    return (
      <span
        className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 font-sans ${getDiplomaticStanceBadgeClass(stance)}`}
      >
        <Handshake size={10} /> {getDiplomaticStanceLabel(stance)}
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
    <span
      className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 font-sans ${getDiplomaticStanceBadgeClass(stance)}`}
    >
      <Globe size={10} /> {getDiplomaticStanceLabel(stance)}
    </span>
  );
}
