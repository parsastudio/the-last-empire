import React from "react";
import { useTranslations } from "next-intl";
import {
  Swords,
  CheckCircle2,
  Handshake,
  Globe,
  ShieldCheck,
  Skull,
} from "lucide-react";
import { DiplomaticStance } from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface TreatyStatusBannerProps {
  stance: DiplomaticStance | string;
  hasSecurityGuarantee?: boolean;
  isEmergencyProtectorate?: boolean;
  dividendAmount?: number;
}

export function TreatyStatusBanner({
  stance,
  hasSecurityGuarantee = false,
  isEmergencyProtectorate = false,
  dividendAmount = 0,
}: TreatyStatusBannerProps) {
  const t = useTranslations("diplomacy");
  const { formatCurrency } = useLocaleFormatter();

  if (isEmergencyProtectorate) {
    return (
      <div className="w-full p-3 rounded-2xl bg-rose-950/40 border border-rose-500/60 text-rose-300 flex items-center justify-between text-xs font-bold font-sans shadow-md gap-2">
        <span className="flex items-center gap-1.5 min-w-0">
          <Skull size={14} className="text-rose-400 animate-pulse shrink-0" />
          <span className="truncate">{t("banners.protectorateTitle")}</span>
        </span>
        <span className="text-[9px] font-mono bg-rose-500/20 px-2 py-0.5 rounded text-rose-300 font-black shrink-0">
          {t("banners.protectorateBadge")}
        </span>
      </div>
    );
  }

  if (stance === "WAR") {
    return (
      <div className="w-full p-3 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-500 flex items-center justify-between text-xs font-bold font-sans shadow-md gap-2">
        <span className="flex items-center gap-1.5 min-w-0">
          <Swords size={14} className="shrink-0 animate-pulse" />
          <span className="truncate">{t("banners.warTitle")}</span>
        </span>
        <span className="text-[9px] font-mono bg-rose-500/20 px-2 py-0.5 rounded text-rose-400 shrink-0 font-black">
          {t(`stances.${stance}`)}
        </span>
      </div>
    );
  }

  if (hasSecurityGuarantee) {
    return (
      <div className="w-full p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 flex items-center justify-between text-xs font-bold font-sans shadow-md gap-2">
        <span className="flex items-center gap-1.5 min-w-0">
          <ShieldCheck
            size={14}
            className="text-cyan-400 animate-pulse shrink-0"
          />
          <span className="truncate">{t("banners.defensePactTitle")}</span>
        </span>
        <span className="text-[9px] font-mono bg-cyan-500/20 px-2 py-0.5 rounded text-cyan-300 shrink-0 font-black">
          {t("banners.defensePactBadge")}
        </span>
      </div>
    );
  }

  if (stance === "STRATEGIC_PARTNERSHIP") {
    const dividendText =
      dividendAmount > 0 ? `: +${formatCurrency(dividendAmount, true)}` : "";

    return (
      <div className="w-full p-3 rounded-2xl bg-gdp/15 border border-gdp/40 text-gdp flex items-center justify-between text-xs font-bold font-sans shadow-md gap-2">
        <span className="flex items-center gap-1.5 min-w-0">
          <CheckCircle2 size={14} className="shrink-0 text-gdp" />
          <span className="truncate">
            {t("banners.partnershipTitle", { dividend: dividendText })}
          </span>
        </span>
        <span className="text-[9px] font-mono bg-gdp/20 px-2 py-0.5 rounded text-gdp shrink-0 font-black">
          {t(`stances.${stance}`)}
        </span>
      </div>
    );
  }

  if (stance === "NON_AGGRESSION_PACT") {
    return (
      <div className="w-full p-3 rounded-2xl bg-treasury/15 border border-treasury/40 text-treasury flex items-center justify-between text-xs font-bold font-sans shadow-md gap-2">
        <span className="flex items-center gap-1.5 min-w-0">
          <Handshake size={14} className="shrink-0" />
          <span className="truncate">{t("banners.nonAggressionTitle")}</span>
        </span>
        <span className="text-[9px] font-mono bg-treasury/20 px-2 py-0.5 rounded text-treasury shrink-0 font-black">
          {t(`stances.${stance}`)}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full p-3 rounded-2xl bg-secondary/60 border border-border/60 text-muted-foreground flex items-center justify-between text-xs font-bold font-sans gap-2">
      <span className="flex items-center gap-1.5 min-w-0">
        <Globe size={14} className="shrink-0 text-primary" />
        <span className="truncate">{t("banners.normalDiplomacyTitle")}</span>
      </span>
      <span className="text-[9px] font-mono bg-background px-2 py-0.5 rounded text-muted-foreground shrink-0 border border-border/40">
        {t(`stances.${stance}`)}
      </span>
    </div>
  );
}
