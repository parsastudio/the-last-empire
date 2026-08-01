import React from "react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { DiplomaticStanceBadge } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/diplomatic-stance-badge";
import { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";

interface DiplomacyTargetCardProps {
  name: string;
  code: string;
  flagCode: string;
  stance: DiplomaticStance | string;
}

export function DiplomacyTargetCard({
  name,
  code,
  flagCode,
  stance,
}: DiplomacyTargetCardProps) {
  const flagEmoji = getFlagEmoji(flagCode || code);

  return (
    <div className="bg-background/50 border border-border/80 p-4 rounded-2xl flex items-center justify-between">
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

      <DiplomaticStanceBadge stance={stance as DiplomaticStance} />
    </div>
  );
}
