import React from "react";
import {
  DiplomaticRelation,
  getQualitativeOpinionColor,
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
  const opinionColor = getQualitativeOpinionColor(relation.opinion);
  const formattedOpinion =
    relation.opinion > 0
      ? `+${PersianNumberFormatter.toPersianDigits(relation.opinion)}`
      : PersianNumberFormatter.toPersianDigits(relation.opinion);

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
          />
        </div>
      </div>
      <div className="text-left font-sans text-[10px] space-y-0.5">
        <span className="text-muted-foreground block text-[9px]">
          دیدگاه کلی:
        </span>
        <span className={`block font-bold ${opinionColor}`}>
          {formattedOpinion}
        </span>
      </div>
    </button>
  );
}
