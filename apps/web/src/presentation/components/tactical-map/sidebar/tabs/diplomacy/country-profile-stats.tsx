import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Coins,
  Users,
  Award,
  Landmark,
  ShoppingCart,
  Lock,
  Skull,
  Cpu,
} from "lucide-react";
import { StabilityBracketUtility } from "@geopolitics/domain";
import { DiplomacyAlliesBox } from "@/presentation/components/tactical-map/command-center/views/components/diplomacy-allies-box";
import { NationAllyDetail } from "@/presentation/components/tactical-map/command-center/views/components/diplomacy-allies-resolver.utility";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";
import { StabilityBracketVisualUtility } from "@/presentation/components/tactical-map/sidebar/utils/stability-bracket-visual.utility";

export interface CountryProfileData {
  gdp: string;
  population: string;
  techLevel: number;
  industrialLevel: number;
  governmentType: string;
  stability: number;
  tension: number;
  guarantorName?: string;
  isEmergencyProtectorate?: boolean;
  isArmsEligible?: boolean;
}

interface CountryProfileStatsProps {
  data: CountryProfileData;
  allies?: NationAllyDetail[];
  onSelectAlly?: (code: string) => void;
}

export function CountryProfileStats({
  data,
  allies = [],
  onSelectAlly,
}: CountryProfileStatsProps) {
  const t = useTranslations("diplomacy.stats");
  const tGovernments = useTranslations("governments");
  const tOverview = useTranslations("overview.stabilityCard.brackets");
  const { formatLevel, formatPercent } = useLocaleFormatter();
  const isArmsEligible = data.isArmsEligible ?? data.tension < 50;

  const bracket = useMemo(
    () => StabilityBracketUtility.getBracket(data.stability),
    [data.stability],
  );

  const visual = useMemo(
    () => StabilityBracketVisualUtility.getVisual(bracket.type),
    [bracket.type],
  );

  const resolvedGovernmentLabel = useMemo(() => {
    const govKey = `${data.governmentType}.name`;
    return tGovernments.has(govKey)
      ? tGovernments(govKey)
      : data.governmentType;
  }, [data.governmentType, tGovernments]);

  return (
    <div className="space-y-3 text-xs text-start font-sans">
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-secondary/40 border border-border/60 p-3 rounded-2xl flex flex-col justify-between min-h-[72px] min-w-0 transition-all hover:bg-secondary/60">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans min-w-0">
            <Coins size={13} className="text-gdp shrink-0" />
            <span className="truncate">{t("gdp")}</span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-foreground font-mono leading-tight break-words pt-1">
            {data.gdp}
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/60 p-3 rounded-2xl flex flex-col justify-between min-h-[72px] min-w-0 transition-all hover:bg-secondary/60">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans min-w-0">
            <Users size={13} className="text-primary shrink-0" />
            <span className="truncate">{t("population")}</span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-foreground font-mono leading-tight break-words pt-1">
            {data.population}
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/60 p-3 rounded-2xl flex flex-col justify-between min-h-[72px] min-w-0 transition-all hover:bg-secondary/60">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans min-w-0">
            <Award size={13} className="text-amber-500 shrink-0" />
            <span className="truncate">{t("militaryTech")}</span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-amber-500 font-mono leading-tight break-words pt-1">
            {formatLevel(data.techLevel)}
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/60 p-3 rounded-2xl flex flex-col justify-between min-h-[72px] min-w-0 transition-all hover:bg-secondary/60">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans min-w-0">
            <Cpu size={13} className="text-primary shrink-0" />
            <span className="truncate">{t("industrialTech")}</span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-primary font-mono leading-tight break-words pt-1">
            {formatLevel(data.industrialLevel)}
          </span>
        </div>
      </div>

      <DiplomacyAlliesBox allies={allies} onSelectAlly={onSelectAlly} />

      {data.isEmergencyProtectorate && data.guarantorName && (
        <div className="p-3 rounded-2xl flex items-center justify-between font-sans border bg-rose-950/20 border-rose-500/40 gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 text-xs text-rose-300 min-w-0">
            <Skull size={14} className="text-rose-400 shrink-0 animate-pulse" />
            <span className="text-[11px] font-bold truncate">
              {t("colonialProtectorate")}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg border bg-rose-500/15 text-rose-300 border-rose-500/30 shrink-0">
            {t("underColonization", { name: data.guarantorName })}
          </span>
        </div>
      )}

      <div className="bg-secondary/40 border border-border/50 p-3 rounded-2xl flex items-center justify-between font-sans gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2 text-xs min-w-0">
          <ShoppingCart
            size={14}
            className={
              isArmsEligible
                ? "text-gdp shrink-0"
                : "text-muted-foreground shrink-0"
            }
          />
          <span className="text-muted-foreground font-bold text-[11px] truncate">
            {t("armsMarketAccess")}
          </span>
        </div>
        {isArmsEligible ? (
          <span className="text-[10px] font-bold text-gdp bg-gdp/15 px-2.5 py-0.5 rounded-lg border border-gdp/30 shrink-0">
            {t("readyToTrade")}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-lg border border-border/60 flex items-center gap-1 shrink-0">
            <Lock size={10} />
            <span>
              {data.tension >= 50 ? t("highTension") : t("noTechSup")}
            </span>
          </span>
        )}
      </div>

      <div className="bg-secondary/40 border border-border/50 p-3 rounded-2xl space-y-2 font-sans">
        <div className="flex items-center justify-between pb-2 border-b border-border/40 gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
            <Landmark size={13} className="text-diplomacy shrink-0" />
            <span className="truncate">{t("governmentType")}</span>
          </div>
          <span className="text-xs font-extrabold text-foreground font-sans text-end">
            {resolvedGovernmentLabel}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-mono gap-2">
          <span className="text-[10px] text-muted-foreground font-sans shrink-0">
            {t("internalStability")}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            <span
              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border ${visual.badgeStyleClass}`}
            >
              {tOverview(bracket.type)}
            </span>
            <span className={`font-bold ${visual.textColorClass}`}>
              {formatPercent(data.stability)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
