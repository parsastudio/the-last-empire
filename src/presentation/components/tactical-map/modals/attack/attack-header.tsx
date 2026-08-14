import React from "react";
import { Swords, Anchor, MapPin } from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

interface AttackHeaderProps {
  attackerName: string;
  attackerCode: string;
  attackerFlagCode: string;
  defenderName: string;
  defenderCode: string;
  defenderFlagCode: string;
  targetRegionName: string;
  isLandNeighbor: boolean;
}

export function AttackHeader({
  attackerName,
  attackerCode,
  attackerFlagCode,
  defenderName,
  defenderCode,
  defenderFlagCode,
  targetRegionName,
  isLandNeighbor,
}: AttackHeaderProps) {
  const attackerFlag = getFlagEmoji(attackerFlagCode || attackerCode);
  const defenderFlag = getFlagEmoji(defenderFlagCode || defenderCode);
  const formattedRegionName = targetRegionName.startsWith("استان")
    ? targetRegionName
    : `استان ${targetRegionName}`;

  return (
    <div className="space-y-3 dir-rtl text-right font-sans">
      <div className="bg-gradient-to-r from-secondary/60 via-card/80 to-secondary/60 border border-border/80 p-4 rounded-3xl flex items-center justify-between gap-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3 text-right">
          <div className="w-13 h-13 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center text-3xl shadow-inner select-none shrink-0">
            {attackerFlag}
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-black text-foreground block">
              {attackerName}
            </span>
            <span className="text-[10px] font-mono text-primary font-bold block">
              فرماندهی تهاجم
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-1 shrink-0">
          <div className="p-3 bg-military/15 text-military border border-military/30 rounded-2xl shadow-lg shadow-military/10 animate-pulse">
            {isLandNeighbor ? <Swords size={20} /> : <Anchor size={20} />}
          </div>
          <span className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest">
            {isLandNeighbor ? "LAND OPS" : "NAVAL OPS"}
          </span>
        </div>

        <div className="flex items-center gap-3 text-left dir-ltr">
          <div className="w-13 h-13 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center text-3xl shadow-inner select-none shrink-0">
            {defenderFlag}
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-black text-foreground block">
              {defenderName}
            </span>
            <span className="text-[10px] font-mono text-military font-bold block">
              کشور مدافع
            </span>
          </div>
        </div>
      </div>

      <div className="bg-secondary/40 border border-border/60 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs font-mono">
        <span className="text-muted-foreground font-sans flex items-center gap-1.5 text-[11px]">
          <MapPin size={14} className="text-primary" />
          منطقه هدف در جبهه:
        </span>
        <span className="font-extrabold text-foreground text-xs font-sans bg-background/80 px-3 py-1 rounded-xl border border-border/80 shadow-sm">
          {formattedRegionName}
        </span>
      </div>
    </div>
  );
}
