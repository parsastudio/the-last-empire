import React from "react";
import { useTranslations } from "next-intl";
import { Swords, Anchor } from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface AttackHeaderProps {
  attackerName: string;
  attackerCode: string;
  attackerFlagCode: string;
  defenderName: string;
  defenderCode: string;
  defenderFlagCode: string;
  originRegionName?: string;
  targetRegionName: string;
  targetProvinceId?: number | null;
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
  targetProvinceId,
  attackType = "LAND",
}: AttackHeaderProps) {
  const t = useTranslations("attack.header");
  const { formatProvinceName } = useLocaleFormatter();
  const attackerFlag = getFlagEmoji(attackerFlagCode || attackerCode);
  const defenderFlag = getFlagEmoji(defenderFlagCode || defenderCode);

  const displayTarget = targetProvinceId
    ? formatProvinceName(targetProvinceId)
    : targetRegionName;

  const isNaval = attackType === "NAVAL";

  return (
    <div className="bg-gradient-to-r from-secondary/80 via-card to-secondary/80 border border-border/80 p-3 md:p-4.5 rounded-2xl md:rounded-3xl flex items-center justify-between gap-2.5 md:gap-4 shadow-xl backdrop-blur-xl relative overflow-hidden text-start font-sans">
      <div className="flex items-center gap-2.5 md:gap-3.5 text-start">
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center text-2xl md:text-3xl shadow-inner select-none shrink-0 ring-1 ring-primary/20">
          {attackerFlag}
        </div>
        <div className="space-y-0.5 md:space-y-1">
          <span className="text-xs md:text-sm font-black text-foreground block tracking-tight truncate max-w-[110px] sm:max-w-none">
            {attackerName}
          </span>
          <span className="text-[9px] md:text-[10px] font-mono text-primary font-bold bg-primary/10 border border-primary/30 px-1.5 py-0.2 md:px-2 md:py-0.5 rounded-md md:rounded-lg inline-block">
            {t("offensiveCommand")}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-0.5 md:gap-1 shrink-0">
        <div className="p-2 md:p-3 bg-military/15 text-military border border-military/35 rounded-xl md:rounded-2xl shadow-lg shadow-military/15 animate-pulse">
          {isNaval ? (
            <Anchor size={17} className="md:w-[22px] md:h-[22px]" />
          ) : (
            <Swords size={17} className="md:w-[22px] md:h-[22px]" />
          )}
        </div>
        <span className="text-[8px] md:text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest">
          {isNaval ? t("navalVector") : t("landVector")}
        </span>
      </div>

      <div className="flex items-center gap-2.5 md:gap-3.5 text-end">
        <div className="space-y-0.5 md:space-y-1 text-end">
          <span className="text-xs md:text-sm font-black text-foreground block tracking-tight truncate max-w-[110px] sm:max-w-none">
            {defenderName}
          </span>
          <span className="text-[9px] md:text-[10px] font-mono text-military font-bold bg-military/10 border border-military/30 px-1.5 py-0.2 md:px-2 md:py-0.5 rounded-md md:rounded-lg inline-block font-sans truncate max-w-[110px] sm:max-w-none">
            {displayTarget}
          </span>
        </div>
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center text-2xl md:text-3xl shadow-inner select-none shrink-0 ring-1 ring-military/20">
          {defenderFlag}
        </div>
      </div>
    </div>
  );
}
