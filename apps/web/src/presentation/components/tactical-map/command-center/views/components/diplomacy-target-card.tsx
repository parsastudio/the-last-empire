import React from "react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { DiplomaticStanceBadge } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/diplomatic-stance-badge";
import { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";
import {
  getQualitativeOpinionLabel,
  getQualitativeOpinionColor,
} from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/utils/relation-resolver";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface DiplomacyTargetCardProps {
  name: string;
  code: string;
  flagCode: string;
  stance: DiplomaticStance | string;
  opinion?: number;
}

export function DiplomacyTargetCard({
  name,
  code,
  flagCode,
  stance,
  opinion = 0,
}: DiplomacyTargetCardProps) {
  const flagEmoji = getFlagEmoji(flagCode || code);
  const opinionLabel = getQualitativeOpinionLabel(opinion);
  const opinionColor = getQualitativeOpinionColor(opinion);
  const formattedOpinion =
    opinion > 0
      ? `+${PersianNumberFormatter.toPersianDigits(opinion)}`
      : PersianNumberFormatter.toPersianDigits(opinion);

  return (
    <div className="bg-background/50 border border-border/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm dir-rtl">
      <div className="flex items-center gap-3">
        <span className="text-3xl select-none" role="img" aria-label={name}>
          {flagEmoji}
        </span>
        <div className="space-y-0.5 text-right">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-foreground">{name}</h3>
            <span className="text-[9px] font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
              {code}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono block">
            شناسنامه رسمی حاکمیت
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5 bg-secondary/80 border border-border/70 px-3 py-1.5 rounded-xl text-xs font-mono">
          <span className="text-[10px] text-muted-foreground font-sans">
            نظر نسبت به شما:
          </span>
          <span className={`font-bold ${opinionColor}`}>
            {formattedOpinion} ({opinionLabel})
          </span>
        </div>

        <DiplomaticStanceBadge stance={stance as DiplomaticStance} />
      </div>
    </div>
  );
}
