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
import { DiplomaticStance, PersianNumberFormatter } from "@geopolitics/domain";

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

  if (isEmergencyProtectorate) {
    return (
      <div className="w-full p-3 rounded-xl bg-rose-950/40 border border-rose-500/60 text-rose-300 flex items-center justify-between text-xs font-bold font-sans shadow-md">
        <span className="flex items-center gap-1.5">
          <Skull size={14} className="text-rose-400 animate-pulse" />
          {t("banners.protectorateTitle")}
        </span>
        <span className="text-[9px] font-mono bg-rose-500/20 px-2 py-0.5 rounded text-rose-300 font-black">
          {t("banners.protectorateBadge")}
        </span>
      </div>
    );
  }

  if (stance === "WAR") {
    return (
      <div className="w-full p-3 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-500 flex items-center justify-between text-xs font-bold font-sans">
        <span className="flex items-center gap-1.5">
          <Swords size={14} />
          {t("banners.warTitle")}
        </span>
        <span className="text-[9px] font-mono bg-rose-500/20 px-2 py-0.5 rounded text-rose-400">
          {t(`stances.${stance}`)}
        </span>
      </div>
    );
  }

  if (hasSecurityGuarantee) {
    return (
      <div className="w-full p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 flex items-center justify-between text-xs font-bold font-sans">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-cyan-400 animate-pulse" />
          {t("banners.defensePactTitle")}
        </span>
        <span className="text-[9px] font-mono bg-cyan-500/20 px-2 py-0.5 rounded text-cyan-300">
          {t("banners.defensePactBadge")}
        </span>
      </div>
    );
  }

  if (stance === "STRATEGIC_PARTNERSHIP") {
    const dividendText =
      dividendAmount > 0
        ? `: +${PersianNumberFormatter.formatCurrency(dividendAmount, true)}`
        : "";

    return (
      <div className="w-full p-3 rounded-xl bg-gdp/15 border border-gdp/40 text-gdp flex items-center justify-between text-xs font-bold font-sans">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={14} />
          {t("banners.partnershipTitle", { dividend: dividendText })}
        </span>
        <span className="text-[9px] font-mono bg-gdp/20 px-2 py-0.5 rounded text-gdp">
          {t(`stances.${stance}`)}
        </span>
      </div>
    );
  }

  if (stance === "NON_AGGRESSION_PACT") {
    return (
      <div className="w-full p-3 rounded-xl bg-treasury/15 border border-treasury/40 text-treasury flex items-center justify-between text-xs font-bold font-sans">
        <span className="flex items-center gap-1.5">
          <Handshake size={14} />
          {t("banners.nonAggressionTitle")}
        </span>
        <span className="text-[9px] font-mono bg-treasury/20 px-2 py-0.5 rounded text-treasury">
          {t(`stances.${stance}`)}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full p-3 rounded-xl bg-secondary/60 border border-border/60 text-muted-foreground flex items-center justify-between text-xs font-bold font-sans">
      <span className="flex items-center gap-1.5">
        <Globe size={14} />
        {t("banners.normalDiplomacyTitle")}
      </span>
      <span className="text-[9px] font-mono bg-background px-2 py-0.5 rounded text-muted-foreground">
        {t(`stances.${stance}`)}
      </span>
    </div>
  );
}
