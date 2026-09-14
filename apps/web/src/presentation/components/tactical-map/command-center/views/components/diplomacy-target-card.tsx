import React from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("diplomacy.stats");
  const { toDigits, formatPercent } = useLocaleFormatter();
  const flagEmoji = getFlagEmoji(flagCode || code);
  const alignColor = getAlignmentColor(alignment);
  const tensionColor = getTensionColor(tension);
  const formattedAlign =
    alignment > 0 ? `+${toDigits(alignment)}` : toDigits(alignment);

  return (
    <div className="bg-card/75 border border-border/80 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md text-start font-sans backdrop-blur-xl">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="text-3xl select-none shrink-0"
          role="img"
          aria-label={name}
        >
          {flagEmoji}
        </span>
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-foreground truncate">
              {name}
            </h3>
            <span className="text-[9px] font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground border border-border/50 shrink-0">
              {code}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5 bg-secondary/80 border border-border/70 px-2.5 py-1 rounded-xl text-xs font-mono">
          <span className="text-[10px] text-muted-foreground font-sans">
            {t("alignmentLabel")}
          </span>
          <span className={`font-bold ${alignColor}`}>{formattedAlign}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-secondary/80 border border-border/70 px-2.5 py-1 rounded-xl text-xs font-mono">
          <span className="text-[10px] text-muted-foreground font-sans">
            {t("tensionLabel")}
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
