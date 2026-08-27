import React from "react";
import { Swords, ArrowLeft } from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

interface AttackHeaderProps {
  attackerName: string;
  attackerCode: string;
  attackerFlagCode: string;
  defenderName: string;
  defenderCode: string;
  defenderFlagCode: string;
  originRegionName: string;
  targetRegionName: string;
}

export function AttackHeader({
  attackerName,
  attackerCode,
  attackerFlagCode,
  defenderName,
  defenderCode,
  defenderFlagCode,
  originRegionName,
  targetRegionName,
}: AttackHeaderProps) {
  const attackerFlag = getFlagEmoji(attackerFlagCode || attackerCode);
  const defenderFlag = getFlagEmoji(defenderFlagCode || defenderCode);

  const formattedOrigin = originRegionName.startsWith("استان")
    ? originRegionName
    : `استان ${originRegionName}`;

  const formattedTarget = targetRegionName.startsWith("استان")
    ? targetRegionName
    : `استان ${targetRegionName}`;

  return (
    <div className="space-y-3 dir-rtl text-right font-sans">
      <div className="bg-gradient-to-r from-secondary/80 via-card to-secondary/80 border border-border/80 p-4.5 rounded-3xl flex items-center justify-between gap-4 shadow-xl backdrop-blur-xl relative overflow-hidden">
        <div className="flex items-center gap-3.5 text-right">
          <div className="w-14 h-14 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center text-3xl shadow-inner select-none shrink-0 ring-1 ring-primary/20">
            {attackerFlag}
          </div>
          <div className="space-y-1">
            <span className="text-sm font-black text-foreground block tracking-tight">
              {attackerName}
            </span>
            <span className="text-[10px] font-mono text-primary font-bold bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-lg inline-block">
              فرماندهی تهاجم
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-1 shrink-0">
          <div className="p-3 bg-military/15 text-military border border-military/35 rounded-2xl shadow-lg shadow-military/15 animate-pulse">
            <Swords size={22} />
          </div>
          <span className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest">
            LAND VECTOR
          </span>
        </div>

        <div className="flex items-center gap-3.5 text-left dir-ltr">
          <div className="w-14 h-14 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center text-3xl shadow-inner select-none shrink-0 ring-1 ring-military/20">
            {defenderFlag}
          </div>
          <div className="space-y-1 text-right">
            <span className="text-sm font-black text-foreground block tracking-tight">
              {defenderName}
            </span>
            <span className="text-[10px] font-mono text-military font-bold bg-military/10 border border-military/30 px-2 py-0.5 rounded-lg inline-block">
              کشور مدافع
            </span>
          </div>
        </div>
      </div>

      <div className="bg-secondary/40 border border-border/70 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs font-mono shadow-inner">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[10px] font-sans text-muted-foreground whitespace-nowrap">
            مبدأ حمله:
          </span>
          <span className="font-bold text-foreground text-xs font-sans bg-background/80 px-3 py-1 rounded-xl border border-border/60 truncate block shadow-sm">
            {formattedOrigin}
          </span>
        </div>

        <div className="flex items-center justify-center shrink-0 text-muted-foreground/80 px-1">
          <ArrowLeft size={16} className="text-primary animate-pulse" />
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="text-[10px] font-sans text-muted-foreground whitespace-nowrap">
            مقصد هدف:
          </span>
          <span className="font-bold text-military text-xs font-sans bg-background/80 px-3 py-1 rounded-xl border border-military/30 truncate block shadow-sm">
            {formattedTarget}
          </span>
        </div>
      </div>
    </div>
  );
}
