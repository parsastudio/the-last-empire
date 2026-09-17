import React from "react";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  ShieldAlert,
  Radio,
  Swords,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { DiplomaticStance } from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface AttackStatusAlertsProps {
  isLandNeighbor: boolean;
  isNavalValid?: boolean;
  isWarStance: boolean;
  currentStance: DiplomaticStance;
  reputationPenalty: number;
  targetNationName: string;
  targetRegionName: string;
  targetProvinceId?: number | null;
  hasAlreadyAttackedThisTurn?: boolean;
  activeGuarantorNames?: string[];
  mutualGuarantorNames?: string[];
  partnerGuarantorNames?: string[];
}

export function AttackStatusAlerts({
  isLandNeighbor,
  isNavalValid = false,
  isWarStance,
  currentStance,
  reputationPenalty,
  targetNationName,
  targetRegionName,
  targetProvinceId,
  hasAlreadyAttackedThisTurn = false,
  activeGuarantorNames = [],
  mutualGuarantorNames = [],
  partnerGuarantorNames = [],
}: AttackStatusAlertsProps) {
  const t = useTranslations("attack.alerts");
  const tDiplomacy = useTranslations("diplomacy.stances");
  const { formatProvinceName, toDigits } = useLocaleFormatter();

  const isAccessible = isLandNeighbor || isNavalValid;
  const formattedRegionName = targetProvinceId
    ? formatProvinceName(targetProvinceId)
    : targetRegionName;

  const stanceLabel = tDiplomacy(currentStance);

  return (
    <div className="space-y-3 text-start font-sans">
      {hasAlreadyAttackedThisTurn && (
        <div className="p-4 bg-amber-500/15 border-2 border-amber-500/50 rounded-2xl flex items-start gap-3 text-xs text-amber-300 font-sans shadow-lg shadow-amber-500/10 animate-fade-smooth">
          <Clock size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-black text-sm block text-amber-400">
              {t("alreadyAttackedTitle")}
            </span>
            <p className="text-[11px] leading-relaxed text-foreground/90">
              {t("alreadyAttackedDesc", { name: targetNationName })}
            </p>
          </div>
        </div>
      )}

      {!isAccessible && (
        <div className="p-4 bg-military/15 border border-military/50 rounded-2xl flex items-start gap-3 text-xs text-military font-sans shadow-lg shadow-military/10 animate-fade-smooth">
          <ShieldAlert size={20} className="shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-black text-sm block">
              {t("inaccessibleTitle")}
            </span>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {t("inaccessibleDesc", { region: formattedRegionName })}
            </p>
          </div>
        </div>
      )}

      {isAccessible && activeGuarantorNames.length > 0 && (
        <div className="p-4 bg-rose-950/40 border-2 border-rose-500/60 rounded-2xl space-y-2 shadow-lg animate-fade-smooth">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400">
              <Swords size={18} className="animate-pulse shrink-0" />
              <span className="text-xs font-black">
                {t("guarantorWarTitle", {
                  names: activeGuarantorNames.join(" - "),
                })}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-lg">
              {t("guarantorWarBadge")}
            </span>
          </div>
          <p className="text-[11px] text-foreground/90 leading-relaxed font-sans font-medium">
            {t("guarantorWarDesc", {
              name: targetNationName,
              guarantors: activeGuarantorNames.join(" - "),
            })}
          </p>
        </div>
      )}

      {isAccessible && mutualGuarantorNames.length > 0 && (
        <div className="p-3.5 bg-amber-950/40 border border-amber-500/50 rounded-2xl space-y-1.5 text-xs text-amber-300 animate-fade-smooth">
          <div className="flex items-center gap-2 font-black text-amber-400">
            <AlertTriangle size={16} className="shrink-0" />
            <span>
              {t("mutualGuarantorTitle", {
                names: mutualGuarantorNames.join(" - "),
              })}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t("mutualGuarantorDesc", {
              names: mutualGuarantorNames.join(" - "),
            })}
          </p>
        </div>
      )}

      {isAccessible && partnerGuarantorNames.length > 0 && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl space-y-1.5 text-xs text-emerald-300 animate-fade-smooth">
          <div className="flex items-center gap-2 font-black text-emerald-400">
            <ShieldCheck size={16} className="shrink-0" />
            <span>
              {t("partnerGuarantorTitle", {
                names: partnerGuarantorNames.join(" - "),
              })}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t("partnerGuarantorDesc", {
              names: partnerGuarantorNames.join(" - "),
            })}
          </p>
        </div>
      )}

      {isAccessible && !isWarStance && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-950/40 via-card to-amber-950/30 border border-amber-500/50 p-3.5 rounded-2xl shadow-lg shadow-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-smooth">
          <div className="absolute top-0 start-0 end-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <AlertTriangle size={18} className="animate-pulse" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <span className="text-xs font-black text-amber-400 block truncate">
                {t("surpriseAttackTitle")}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono block truncate">
                {t("currentStance", {
                  stance: stanceLabel,
                })}
              </span>
            </div>
          </div>

          <span className="text-[10px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0 shadow-sm">
            <Radio size={12} className="animate-ping text-amber-400" />
            <span>
              {t("reputationPenaltyBadge", {
                points: toDigits(reputationPenalty),
              })}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
