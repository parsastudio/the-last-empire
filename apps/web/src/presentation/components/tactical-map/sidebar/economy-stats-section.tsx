import React from "react";
import { useTranslations } from "next-intl";
import {
  Coins,
  Building2,
  Landmark,
  Factory,
  ArrowUpRight,
  TrendingDown,
} from "lucide-react";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface EconomyStatsSectionProps {
  gdp: number;
  treasury: number;
  nationalDebt: number;
  availableLoanLimit: number;
  debtInterestPerTurn: number;
  totalActiveFactories: number;
}

export function EconomyStatsSection({
  gdp,
  treasury,
  nationalDebt,
  availableLoanLimit,
  debtInterestPerTurn,
  totalActiveFactories,
}: EconomyStatsSectionProps) {
  const t = useTranslations("overview.economy");
  const { formatCurrency, formatNumber } = useLocaleFormatter();

  const formattedGdp = formatCurrency(gdp, true);
  const compactTreasury = formatCurrency(treasury, true);
  const formattedDebt = formatCurrency(Math.round(nationalDebt), true);
  const formattedLoanAvailable = formatCurrency(availableLoanLimit, true);
  const formattedInterest = formatCurrency(debtInterestPerTurn, true);

  return (
    <div className="space-y-3 text-start font-sans">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Coins size={14} className="text-gdp" />
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider font-mono">
            {t("title")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono">
        <div className="bg-background/60 border border-border/70 p-4 rounded-3xl space-y-1 shadow-sm">
          <span className="text-[10px] text-muted-foreground block font-sans font-bold flex items-center gap-1.5">
            <Building2 size={13} className="text-primary shrink-0" />
            <span>{t("gdp")}</span>
          </span>
          <span className="text-sm font-black text-foreground block">
            {formattedGdp}
          </span>
        </div>

        <div className="bg-background/60 border border-border/70 p-4 rounded-3xl space-y-1 shadow-sm">
          <span className="text-[10px] text-muted-foreground block font-sans font-bold flex items-center gap-1.5">
            <Coins size={13} className="text-gdp shrink-0" />
            <span>{t("treasury")}</span>
          </span>
          <span className="text-sm font-black text-gdp block truncate">
            {compactTreasury}
          </span>
        </div>

        <div className="bg-background/60 border border-border/70 p-4 rounded-3xl space-y-1 shadow-sm">
          <span className="text-[10px] text-muted-foreground block font-sans font-bold flex items-center gap-1.5">
            <Factory size={13} className="text-gdp shrink-0" />
            <span>{t("factories")}</span>
          </span>
          <span className="text-sm font-black text-foreground block">
            {t("factoryUnit", {
              count: formatNumber(totalActiveFactories),
            })}
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-secondary/80 via-card to-secondary/80 border border-border/80 p-4.5 rounded-3xl space-y-3 shadow-lg">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Landmark size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black text-foreground">
                {t("imfSectionTitle")}
              </h4>
              <span className="text-[10px] text-muted-foreground font-sans">
                {t("imfSectionSubtitle")}
              </span>
            </div>
          </div>

          <span
            className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
              nationalDebt > 0
                ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
            }`}
          >
            {nationalDebt > 0 ? t("hasDebt") : t("noDebt")}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
          <div className="bg-background/60 p-3 rounded-2xl border border-border/60 space-y-1">
            <span className="text-[10px] text-muted-foreground font-sans flex items-center gap-1">
              <TrendingDown size={12} className="text-military" />
              <span>{t("totalDebt")}</span>
            </span>
            <span
              className={`text-xs font-black ${
                nationalDebt > 0 ? "text-military" : "text-foreground"
              }`}
            >
              {formattedDebt}
            </span>
          </div>

          <div className="bg-background/60 p-3 rounded-2xl border border-border/60 space-y-1">
            <span className="text-[10px] text-muted-foreground font-sans flex items-center gap-1">
              <ArrowUpRight size={12} className="text-gdp" />
              <span>{t("creditCeiling")}</span>
            </span>
            <span className="text-xs font-black text-gdp">
              {formattedLoanAvailable}
            </span>
          </div>

          <div className="bg-background/60 p-3 rounded-2xl border border-border/60 space-y-1">
            <span className="text-[10px] text-muted-foreground font-sans flex items-center gap-1">
              <Coins size={12} className="text-amber-400" />
              <span>{t("turnInterest")}</span>
            </span>
            <span className="text-xs font-black text-amber-400">
              {formattedInterest} {t("perTurn")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
