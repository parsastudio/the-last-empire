import React from "react";
import {
  DiplomaticRelation,
  getAlignmentColor,
  getTensionColor,
} from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/utils/relation-resolver";
import { DiplomaticStanceBadge } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/diplomatic-stance-badge";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface DiplomacyListItemProps {
  relation: DiplomaticRelation;
  onSelect: (relation: DiplomaticRelation) => void;
}

export function DiplomacyListItem({
  relation,
  onSelect,
}: DiplomacyListItemProps) {
  const alignColor = getAlignmentColor(relation.alignment);
  const tensionColor = getTensionColor(relation.tension);
  const formattedAlign =
    relation.alignment > 0
      ? `+${PersianNumberFormatter.toPersianDigits(relation.alignment)}`
      : PersianNumberFormatter.toPersianDigits(relation.alignment);

  return (
    <button
      onClick={() => onSelect(relation)}
      className="w-full bg-background/40 hover:bg-secondary/50 border border-border/60 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-right transition-all cursor-pointer dir-rtl"
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
            #{PersianNumberFormatter.toPersianDigits(relation.rank)}
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
      <div className="text-left font-sans text-[10px] space-y-0.5">
        <div className="flex items-center gap-1 justify-end">
          <span className="text-muted-foreground text-[9px]">همسویی:</span>
          <span className={`font-bold font-mono ${alignColor}`}>
            {formattedAlign}
          </span>
        </div>
        <div className="flex items-center gap-1 justify-end">
          <span className="text-muted-foreground text-[9px]">تنش:</span>
          <span className={`font-bold font-mono ${tensionColor}`}>
            {PersianNumberFormatter.toPersianDigits(relation.tension)}٪
          </span>
        </div>
      </div>
    </button>
  );
}
