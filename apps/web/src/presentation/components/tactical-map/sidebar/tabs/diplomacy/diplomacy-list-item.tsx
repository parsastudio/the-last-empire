import React from "react";
import { useTranslations } from "next-intl";
import {
  DiplomaticRelation,
  getAlignmentColor,
  getTensionColor,
} from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/utils/relation-resolver";
import { DiplomaticStanceBadge } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/diplomatic-stance-badge";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface DiplomacyListItemProps {
  relation: DiplomaticRelation;
  onSelect: (relation: DiplomaticRelation) => void;
}

export function DiplomacyListItem({
  relation,
  onSelect,
}: DiplomacyListItemProps) {
  const t = useTranslations("diplomacy.stats");
  const { toDigits, formatPercent } = useLocaleFormatter();
  const alignColor = getAlignmentColor(relation.alignment);
  const tensionColor = getTensionColor(relation.tension);
  const formattedAlign =
    relation.alignment > 0
      ? `+${toDigits(relation.alignment)}`
      : toDigits(relation.alignment);

  return (
    <button
      onClick={() => onSelect(relation)}
      className="w-full bg-background/40 hover:bg-secondary/50 border border-border/60 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-start transition-all cursor-pointer"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground">
            {relation.name}
          </span>
          <span className="text-[9px] font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
            {relation.code}
          </span>
          <span className="text-[9px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">
            #{toDigits(relation.rank)}
          </span>
        </div>
        <div>
          <DiplomaticStanceBadge
            stance={relation.stance}
            posture={relation.posture}
            hasSecurityGuarantee={relation.hasSecurityGuarantee}
            isEmergencyProtectorate={relation.isEmergencyProtectorate}
          />
        </div>
      </div>
      <div className="text-end font-sans text-[10px] space-y-0.5">
        <div className="flex items-center gap-1 justify-end">
          <span className="text-muted-foreground text-[9px]">
            {t("alignmentLabel")}
          </span>
          <span className={`font-bold font-mono ${alignColor}`}>
            {formattedAlign}
          </span>
        </div>
        <div className="flex items-center gap-1 justify-end">
          <span className="text-muted-foreground text-[9px]">
            {t("tensionLabel")}
          </span>
          <span className={`font-bold font-mono ${tensionColor}`}>
            {formatPercent(relation.tension)}
          </span>
        </div>
      </div>
    </button>
  );
}
