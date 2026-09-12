import React from "react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { DiplomaticStanceBadge } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/diplomatic-stance-badge";
import { DiplomaticStance, DiplomaticPosture } from "@geopolitics/domain";
import {
  getAlignmentColor,
  getTensionColor,
} from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/utils/relation-resolver";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface DiplomacyTargetCardProps {
  name: string;
  code: string;
  flagCode: string;
  stance: DiplomaticStance | string;
  alignment?: number;
  tension?: number;
  posture?: DiplomaticPosture;
  hasSecurityGuarantee?: boolean;
  isEmergencyProtectorate?: boolean;
}

export function DiplomacyTargetCard({
  name,
  code,
  flagCode,
  stance,
  alignment = 0,
  tension = 10,
  posture,
  hasSecurityGuarantee = false,
  isEmergencyProtectorate = false,
}: DiplomacyTargetCardProps) {
  const { toDigits, formatPercent } = useLocaleFormatter();
  const flagEmoji = getFlagEmoji(flagCode || code);
  const alignColor = getAlignmentColor(alignment);
  const tensionColor = getTensionColor(tension);
  const formattedAlign =
    alignment > 0 ? `+${toDigits(alignment)}` : toDigits(alignment);

  return (
    <div className="bg-background/50 border border-border/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm text-start font-sans">
      <div className="flex items-center gap-3">
        <span className="text-3xl select-none" role="img" aria-label={name}>
          {flagEmoji}
        </span>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-extrabold text-foreground">{name}</h3>
          <span className="text-[9px] font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
            {code}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5 bg-secondary/80 border border-border/70 px-3 py-1.5 rounded-xl text-xs font-mono">
          <span className="text-[10px] text-muted-foreground font-sans">
            Alignment:
          </span>
          <span className={`font-bold ${alignColor}`}>{formattedAlign}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-secondary/80 border border-border/70 px-3 py-1.5 rounded-xl text-xs font-mono">
          <span className="text-[10px] text-muted-foreground font-sans">
            Tension:
          </span>
          <span className={`font-bold ${tensionColor}`}>
            {formatPercent(tension)}
          </span>
        </div>

        <DiplomaticStanceBadge
          stance={stance as DiplomaticStance}
          posture={posture}
          hasSecurityGuarantee={hasSecurityGuarantee}
          isEmergencyProtectorate={isEmergencyProtectorate}
        />
      </div>
    </div>
  );
}
