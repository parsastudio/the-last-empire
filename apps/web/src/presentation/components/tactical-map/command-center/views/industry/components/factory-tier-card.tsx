import React from "react";
import { useTranslations } from "next-intl";
import {
  Factory,
  TrendingUp,
  Coins,
  Plus,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Building2,
} from "lucide-react";
import { IndustryCalculator } from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";
import { FactoryTierUpgradeItem } from "../hooks/use-factory-tier-procurement";

interface FactoryTierCardProps {
  item: FactoryTierUpgradeItem;
  totalFactories: number;
  actionLabel?: string;
  feedbacks?: { id: string; text: string }[];
  isSubmitting?: boolean;
  onUpgrade: (item: FactoryTierUpgradeItem) => void;
}

export function FactoryTierCard({
  item,
  totalFactories,
  actionLabel,
  feedbacks = [],
  isSubmitting = false,
  onUpgrade,
}: FactoryTierCardProps) {
  const t = useTranslations("industry.tiers");
  const { formatCurrency, formatNumber, toDigits } = useLocaleFormatter();

  const {
    batch,
    rankIndex,
    isMaxedOut,
    targetTech,
    batchQuantity,
    batchCost,
    canAfford,
  } = item;

  const percentage =
    totalFactories > 0 ? Math.round((batch.count / totalFactories) * 100) : 100;

  const singleYield = IndustryCalculator.calculateFactoryYield(batch.techLevel);
  const totalTierYield = batch.count * singleYield;
  const effectiveActionLabel = actionLabel || t("domesticActionDefault");

  return (
    <div
      className={`relative p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 font-sans text-start shadow-2xl backdrop-blur-2xl overflow-hidden group hover:scale-[1.01] ring-1 ring-white/5 ${
        isMaxedOut
          ? "bg-gradient-to-b from-card via-secondary/70 to-card/95 border-border/80 hover:border-gdp/40 shadow-black/50"
          : "bg-gradient-to-b from-card via-secondary/80 to-card border-border/90 hover:border-gdp/50 shadow-gdp/10"
      }`}
    >
      <div
        className={`absolute top-0 start-0 end-0 h-1 bg-gradient-to-r ${
          isMaxedOut
            ? "from-transparent via-gdp/60 to-transparent"
            : "from-transparent via-primary/60 to-transparent"
        }`}
      />

      <div className="space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-md shrink-0 ${
                isMaxedOut
                  ? "bg-gdp/15 text-gdp border-gdp/30 shadow-gdp/10 ring-1 ring-gdp/20"
                  : "bg-primary/15 text-primary border-primary/30 shadow-primary/10 ring-1 ring-primary/20"
              }`}
            >
              <Factory size={18} className="animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-foreground">
                {t("lineTier", {
                  rank: toDigits(rankIndex + 1),
                })}
              </h4>
              <span className="text-[10px] font-mono text-muted-foreground block">
                {isMaxedOut
                  ? t("maxEfficiency")
                  : t("upgradeTarget", {
                      level: toDigits(targetTech.toFixed(1)),
                    })}
              </span>
            </div>
          </div>

          {isMaxedOut ? (
            <div className="px-2.5 py-1 rounded-xl border font-mono font-bold text-[11px] flex items-center gap-1 shrink-0 bg-gdp/15 text-gdp border-gdp/40">
              <Sparkles size={11} />
              <span>
                {t("levelLabel", {
                  level: toDigits(batch.techLevel.toFixed(1)),
                })}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-black shrink-0">
              <span className="text-muted-foreground bg-secondary/80 border border-border/60 px-2 py-0.5 rounded-lg">
                {t("levelPrefix", {
                  level: toDigits(batch.techLevel.toFixed(1)),
                })}
              </span>
              <ArrowRight
                size={13}
                className="text-gdp shrink-0 animate-pulse rtl:rotate-180"
              />
              <span className="text-gdp bg-gdp/15 border border-gdp/30 px-2 py-0.5 rounded-lg">
                {t("levelPrefix", {
                  level: toDigits(targetTech.toFixed(1)),
                })}
              </span>
            </div>
          )}
        </div>

        <div className="bg-background/70 border border-border/70 p-3.5 rounded-2xl space-y-2 shadow-inner font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-sans">
            <span className="flex items-center gap-1.5 font-bold">
              <Building2 size={13} className="text-primary" />
              <span>{t("tierFactoriesLabel")}</span>
            </span>
            <span className="font-mono font-bold text-gdp bg-gdp/10 border border-gdp/25 px-2 py-0.5 rounded-md text-[10px]">
              {t("shareOfTotal", {
                pct: toDigits(percentage),
              })}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-0.5">
            <div className="text-xl font-black font-mono text-foreground tracking-tight">
              {t("activeSheds", {
                count: formatNumber(batch.count),
              })}
            </div>
          </div>

          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden border border-border/40">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isMaxedOut
                  ? "bg-gdp shadow-sm shadow-gdp/50"
                  : "bg-primary shadow-sm shadow-primary/50"
              }`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/40 font-mono text-xs">
            <span className="text-muted-foreground font-sans text-[11px] flex items-center gap-1">
              <TrendingUp size={12} className="text-emerald-400" />
              <span>{t("totalValue")}</span>
            </span>
            <span className="font-black text-emerald-400 text-xs">
              {formatCurrency(totalTierYield, true)}
            </span>
          </div>
        </div>
      </div>

      <div className="relative pt-1 space-y-2 font-mono">
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center z-30 select-none">
          {feedbacks.map((f) => (
            <span
              key={f.id}
              className="text-sm font-black font-mono text-emerald-400 drop-shadow-[0_2px_10px_rgba(16,185,129,0.9)] tracking-wide animate-out fade-out slide-out-to-top-6 duration-700 whitespace-nowrap"
            >
              {f.text}
            </span>
          ))}
        </div>

        {isMaxedOut ? (
          <div className="w-full py-2.5 bg-emerald-950/20 text-emerald-400/90 rounded-2xl text-[11px] font-bold border border-emerald-500/30 flex items-center justify-center gap-1.5 select-none shadow-inner font-sans">
            <CheckCircle2 size={14} className="text-gdp" />
            <span>
              {t("maxTechEquipped", {
                level: toDigits(batch.techLevel.toFixed(1)),
              })}
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-1 text-[11px]">
              <span className="text-muted-foreground font-sans text-[10px] flex items-center gap-1">
                <Coins size={11} className="text-amber-400" />
                <span>{t("investPackage")}</span>
              </span>
              <span className="font-extrabold text-foreground text-xs">
                {formatCurrency(batchCost, true)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onUpgrade(item)}
              disabled={!canAfford || isSubmitting}
              className="w-full py-2.5 px-3.5 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl text-xs font-bold font-sans transition-all cursor-pointer shadow-md shadow-gdp/15 hover:scale-[1.005] active:scale-[0.995] flex items-center justify-center gap-1.5 border border-gdp/30"
              title={`${effectiveActionLabel} - ${batchQuantity}`}
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>
                {t("upgradeAction", {
                  label: effectiveActionLabel,
                  count: formatNumber(batchQuantity),
                })}
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
