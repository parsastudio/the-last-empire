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
    try {
      return tGovernments(`${data.governmentType}.name`);
    } catch {
      return data.governmentType;
    }
  }, [data.governmentType, tGovernments]);

  return (
    <div className="space-y-3 font-mono text-xs text-start font-sans">
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-secondary/40 border border-border/50 p-3 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans">
            <Coins size={13} className="text-gdp shrink-0" />
            <span className="whitespace-nowrap">{t("gdp")}</span>
          </div>
          <span className="text-xs font-bold text-foreground block font-mono">
            {data.gdp}
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/50 p-3 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans">
            <Users size={13} className="text-primary shrink-0" />
            <span className="whitespace-nowrap">{t("population")}</span>
          </div>
          <span className="text-xs font-bold text-foreground block font-mono">
            {data.population}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-secondary/40 border border-border/50 p-3.5 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 font-sans text-xs">
            <Award size={15} className="text-amber-500 shrink-0" />
            <span className="text-muted-foreground font-bold text-[10px] whitespace-nowrap">
              {t("militaryTech")}
            </span>
          </div>
          <span className="text-xs font-bold text-amber-500 font-mono block">
            {formatLevel(data.techLevel)}
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/50 p-3.5 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 font-sans text-xs">
            <Cpu size={15} className="text-primary shrink-0" />
            <span className="text-muted-foreground font-bold text-[10px] whitespace-nowrap">
              {t("industrialTech")}
            </span>
          </div>
          <span className="text-xs font-bold text-primary font-mono block">
            {formatLevel(data.industrialLevel)}
          </span>
        </div>
      </div>

      <DiplomacyAlliesBox allies={allies} onSelectAlly={onSelectAlly} />

      {data.isEmergencyProtectorate && data.guarantorName && (
        <div className="p-3 rounded-2xl flex items-center justify-between font-sans border bg-rose-950/20 border-rose-500/40">
          <div className="flex items-center gap-1.5 text-xs text-rose-300">
            <Skull size={14} className="text-rose-400 shrink-0 animate-pulse" />
            <span className="text-[11px] font-bold">
              {t("colonialProtectorate")}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg border bg-rose-500/15 text-rose-300 border-rose-500/30">
            {t("underColonization", { name: data.guarantorName })}
          </span>
        </div>
      )}

      <div className="bg-secondary/40 border border-border/50 p-3.5 rounded-2xl flex items-center justify-between font-sans">
        <div className="flex items-center gap-2 text-xs">
          <ShoppingCart
            size={15}
            className={isArmsEligible ? "text-gdp" : "text-muted-foreground"}
          />
          <span className="text-muted-foreground font-bold text-[11px]">
            {t("armsMarketAccess")}
          </span>
        </div>
        {isArmsEligible ? (
          <span className="text-[10px] font-bold text-gdp bg-gdp/15 px-2.5 py-0.5 rounded-lg border border-gdp/30">
            {t("readyToTrade")}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-lg border border-border/60 flex items-center gap-1">
            <Lock size={10} />
            {data.tension >= 50 ? t("highTension") : t("noTechSup")}
          </span>
        )}
      </div>

      <div className="bg-secondary/40 border border-border/50 p-3.5 rounded-2xl space-y-2 font-sans">
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Landmark size={13} className="text-diplomacy shrink-0" />
            <span>{t("governmentType")}</span>
          </div>
          <span className="text-xs font-extrabold text-foreground font-sans">
            {resolvedGovernmentLabel}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[10px] text-muted-foreground font-sans">
            {t("internalStability")}
          </span>
          <div className="flex items-center gap-2">
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
