import React from "react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

interface DiplomacyTargetCardProps {
  name: string;
  code: string;
  flagCode: string;
  stance: string;
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

      <span className="px-2.5 py-1 rounded-lg bg-secondary border border-border/80 text-muted-foreground text-[10px] font-bold">
        {stance === "WAR" ? "در حال جنگ" : "دیپلماسی عادی"}
      </span>
    </div>
  );
}
