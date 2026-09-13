import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ShoppingCart, Coins, Award, Globe, TrendingUp } from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { Nation, NationGettersUtility } from "@geopolitics/domain";
import { ExportSalesModalData } from "@/presentation/stores/use-ui-store";
import { NationResolverUtility } from "@/presentation/utils/nation-resolver.utility";
import { TacticalSound } from "@/presentation/utils/tactical-sound";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface ExportSalesDetailsModalProps {
  isOpen: boolean;
  data: ExportSalesModalData | null;
  nationsMap?: Record<string, Nation>;
  onClose: () => void;
}

export function ExportSalesDetailsModal({
  isOpen,
  data,
  nationsMap,
  onClose,
}: ExportSalesDetailsModalProps) {
  const t = useTranslations("reports.exportSales");
  const { formatCurrency, toDigits, countryTranslator } = useLocaleFormatter();

  useEffect(() => {
    if (isOpen) {
      TacticalSound.playCoinSound();
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const buyersWithDetails = data.buyers.map((item) => {
    const resolved = NationResolverUtility.resolve(
      item.nationId,
      nationsMap,
      countryTranslator,
    );
    const rank = resolved.nation
      ? NationGettersUtility.getRank(resolved.nation.id, nationsMap)
      : 99;

    return {
      nationId: item.nationId,
      name: resolved.name,
      flag: resolved.flagEmoji,
      amount: item.amount,
      rank,
    };
  });

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={t("modalTitle")}
      subtitle={t("modalSubtitle", {
        turn: toDigits(data.turn),
      })}
      maxWidthClass="max-w-lg"
      onClose={onClose}
    >
      <div className="space-y-4 text-start font-sans pb-1">
        <div className="bg-gradient-to-r from-emerald-950/40 via-card to-emerald-950/30 border border-emerald-500/40 p-4.5 rounded-3xl flex items-center justify-between shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Coins size={22} className="animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                {t("totalRevenueHeader")}
              </span>
              <h3 className="text-base font-black text-foreground">
                {t("totalProfitTitle")}
              </h3>
            </div>
          </div>

          <div className="text-end font-mono">
            <span className="text-base font-black text-gdp">
              +{formatCurrency(data.totalProfit, true)}
            </span>
            <span className="text-[10px] text-muted-foreground block font-sans">
              {t("fromCountries", {
                count: toDigits(data.buyers.length),
              })}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
              <ShoppingCart size={13} className="text-primary" />
              {t("buyersList")}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {t("descendingSort")}
            </span>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pe-1 scrollbar-thin scrollbar-thumb-border">
            {buyersWithDetails.map((buyer, idx) => (
              <div
                key={buyer.nationId}
                className="bg-card/90 border border-border/80 hover:border-emerald-500/40 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl select-none shrink-0">
                    {buyer.flag}
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-foreground">
                        {buyer.name}
                      </span>
                      <span className="text-[9px] font-mono font-bold bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                        #{toDigits(idx + 1)}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                      <Award size={10} className="text-amber-500" />
                      <span>
                        {t("worldRank", {
                          rank: toDigits(buyer.rank),
                        })}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <div className="text-start bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                    <span className="text-xs font-black text-gdp flex items-center gap-1">
                      <TrendingUp size={11} />
                      {formatCurrency(buyer.amount, true)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-secondary/40 border border-border/60 rounded-2xl flex items-center justify-between text-[11px] font-mono">
          <span className="text-muted-foreground font-sans flex items-center gap-1.5">
            <Globe size={13} className="text-primary shrink-0" />
            {t("tradeCredibility")}
          </span>
          <span className="font-extrabold text-gdp font-sans">
            {t("sustainableExport")}
          </span>
        </div>
      </div>
    </UnifiedModalShell>
  );
}
