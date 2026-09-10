import React from "react";
import { DiplomaticStance } from "@geopolitics/domain";
import { DiplomaticStanceBadge } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/diplomatic-stance-badge";

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
  return (
    <DiplomaticStanceBadge
      stance={rawStance}
      isOwnCountry={isOwnCountry}
      hasSecurityGuarantee={hasSecurityGuarantee}
    />
  );
}
