import React from "react";
import { Swords, Anchor } from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { ProvinceNameFormatter } from "@/presentation/utils/province-name-formatter";

interface AttackHeaderProps {
  attackerName: string;
  attackerCode: string;
  attackerFlagCode: string;
  defenderName: string;
  defenderCode: string;
  defenderFlagCode: string;
  originRegionName?: string;
  targetRegionName: string;
  attackType?: "LAND" | "NAVAL";
}

export function AttackHeader({
  attackerName,
  attackerCode,
  attackerFlagCode,
  defenderName,
  defenderCode,
  defenderFlagCode,
  targetRegionName,
  attackType = "LAND",
}: AttackHeaderProps) {
  const attackerFlag = getFlagEmoji(attackerFlagCode || attackerCode);
  const defenderFlag = getFlagEmoji(defenderFlagCode || defenderCode);
  const formattedTarget = ProvinceNameFormatter.format(targetRegionName);
  const isNaval = attackType === "NAVAL";

  return (
    <div className="bg-gradient-to-r from-secondary/80 via-card to-secondary/80 border border-border/80 p-4.5 rounded-3xl flex items-center justify-between gap-4 shadow-xl backdrop-blur-xl relative overflow-hidden dir-rtl text-right font-sans">
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
          {isNaval ? <Anchor size={22} /> : <Swords size={22} />}
        </div>
        <span className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest">
          {isNaval ? "NAVAL VECTOR" : "LAND VECTOR"}
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
          <span className="text-[10px] font-mono text-military font-bold bg-military/10 border border-military/30 px-2 py-0.5 rounded-lg inline-block font-sans">
            {formattedTarget}
          </span>
        </div>
      </div>
    </div>
  );
}
