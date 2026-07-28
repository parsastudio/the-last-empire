import React from "react";
import { DiplomaticRelation } from "./diplomacy-detail-view";
import { DiplomaticStanceBadge } from "./diplomatic-stance-badge";

interface DiplomacyListItemProps {
  relation: DiplomaticRelation;
  onSelect: (relation: DiplomaticRelation) => void;
}

export function DiplomacyListItem({
  relation,
  onSelect,
}: DiplomacyListItemProps) {
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
        </div>
        <div>
          <DiplomaticStanceBadge stance={relation.stance} />
        </div>
      </div>
      <div className="text-left font-mono text-[10px] text-muted-foreground">
        <span>نظر: {relation.opinion}°</span>
      </div>
    </button>
  );
}
