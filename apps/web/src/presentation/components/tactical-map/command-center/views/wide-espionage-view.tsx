import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ShieldAlert, Binary, Award, Users, Cpu } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { EspionageTargetSelector } from "@/presentation/components/tactical-map/command-center/views/espionage/espionage-target-selector";
import { EspionageTierCard } from "@/presentation/components/tactical-map/command-center/views/espionage/espionage-tier-card";
import { EspionageResultBanner } from "@/presentation/components/tactical-map/command-center/views/espionage/espionage-result-banner";
import { useWideEspionageForm } from "@/presentation/components/tactical-map/command-center/views/hooks/use-wide-espionage-form";
import {
  NationGettersUtility,
  NationTurnActivity,
  CountryRegistry,
} from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface WideEspionageViewProps {
  nation: Nation;
  nationsMap?: Record<string, Nation>;
  provincesMap?: Record<string, Province>;
  selectedTargetCode?: string | null;
  turnActivity?: NationTurnActivity;
}

export function WideEspionageView({
  nation,
  nationsMap,
  provincesMap,
  selectedTargetCode,
  turnActivity,
}: WideEspionageViewProps) {
  const t = useTranslations("espionage");
  const { formatCurrency, toDigits, locale } = useLocaleFormatter();

  const form = useWideEspionageForm({
    nation,
    nationsMap,
    provincesMap,
    selectedTargetCode,
    turnActivity,
  });

  const targetRank = form.selectedTargetNation
    ? NationGettersUtility.getRank(
        form.selectedTargetNation.id,
        nationsMap,
        provincesMap,
      )
    : 99;

  const targetProfile = form.selectedTargetNation
    ? CountryRegistry.getCountry(form.selectedTargetNation.id)
    : null;

  const targetDisplayName = form.selectedTargetNation
    ? locale === "en"
      ? targetProfile?.nameEn || form.selectedTargetNation.name
      : form.selectedTargetNation.name
    : "";

  const tier3Subtitle = useMemo(() => {
    if (!form.selectedTargetNation) return "";
    const sup = form.techSuperiority;
    if (sup.heistMode === "DUAL") {
      return t("view.subtitles.dual", { name: targetDisplayName });
    }
    if (sup.heistMode === "MILITARY_ONLY") {
      return t("view.subtitles.militaryOnly", {
        name: targetDisplayName,
        points: toDigits(sup.militaryGain.toFixed(1)),
      });
    }
    if (sup.heistMode === "INDUSTRIAL_ONLY") {
      return t("view.subtitles.industrialOnly", {
        name: targetDisplayName,
        points: toDigits(sup.industrialGain.toFixed(1)),
      });
    }
    return t("view.subtitles.none", { name: targetDisplayName });
  }, [
    form.selectedTargetNation,
    targetDisplayName,
    form.techSuperiority,
    t,
    toDigits,
  ]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200 text-start font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-start">
        <div className="lg:col-span-4">
          <EspionageTargetSelector
            targets={form.countryOptions}
            selectedTargetId={form.selectedTargetId}
            searchQuery={form.searchQuery}
            onSearchChange={form.setSearchQuery}
            onSelectTarget={form.setSelectedTargetId}
          />
        </div>

        <div className="lg:col-span-8 space-y-4 bg-background/40 p-5 border border-border/80 rounded-3xl">
          {form.selectedTargetNation ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <span
                    className="text-3xl select-none"
                    role="img"
                    aria-label={targetDisplayName}
                  >
                    {getFlagEmoji(form.selectedTargetNation.flagCode)}
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                      <span>
                        {t("view.blackOpsTitle", {
                          name: targetDisplayName,
                        })}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-secondary px-2 py-0.5 rounded-lg text-muted-foreground border border-border/60">
                        {t("view.rank", {
                          rank: toDigits(targetRank),
                        })}
                      </span>
                    </h3>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {t("view.meta", {
                        gdp: formatCurrency(form.targetGdp, true),
                        stability: toDigits(
                          form.selectedTargetNation.government.stability,
                        ),
                      })}
                    </span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 font-mono text-[10px]">
                  <div className="flex items-center gap-1 bg-secondary/80 px-2.5 py-1 rounded-xl text-primary font-bold border border-primary/20">
                    <Award size={12} />
                    <span>
                      {t("view.yourMilTech", {
                        level: toDigits(nation.military.techLevel.toFixed(1)),
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-secondary/80 px-2.5 py-1 rounded-xl text-gdp font-bold border border-gdp/20">
                    <Cpu size={12} />
                    <span>
                      {t("view.yourIndTech", {
                        level: toDigits(nation.industrialLevel.toFixed(1)),
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {form.lastResult && (
                <EspionageResultBanner result={form.lastResult} />
              )}

              <div className="grid grid-cols-1 gap-3.5">
                <EspionageTierCard
                  tier={2}
                  title={t("tiers.tier2.title")}
                  subtitle={t("tiers.tier2.subtitle")}
                  icon={ShieldAlert}
                  iconColorClass="text-military"
                  borderColorClass="border-military/40"
                  cost={form.tier2Cost}
                  successRate={form.tier2SuccessRate}
                  isExecutedThisTurn={form.isTierExecuted(2)}
                  canAfford={nation.treasury >= form.tier2Cost}
                  isExecuting={form.isSubmitting}
                  onExecute={() => form.handleExecute(2)}
                />

                <EspionageTierCard
                  tier={3}
                  title={t("tiers.tier3.title")}
                  subtitle={tier3Subtitle}
                  icon={Binary}
                  iconColorClass="text-amber-500"
                  borderColorClass="border-amber-500/40"
                  cost={form.tier3Cost}
                  successRate={form.tier3SuccessRate}
                  isExecutedThisTurn={form.isTierExecuted(3)}
                  canAfford={nation.treasury >= form.tier3Cost}
                  isDisabledCondition={
                    form.techSuperiority.totalAvailablePoints < 0.5
                  }
                  disabledReasonText={t("tiers.tier3.disabledReason")}
                  isExecuting={form.isSubmitting}
                  onExecute={() => form.handleExecute(3)}
                />
              </div>
            </>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center gap-4 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary/60 border border-border flex items-center justify-center text-muted-foreground">
                <Users size={28} />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className="text-sm font-bold text-foreground font-sans">
                  {t("view.emptyTitle")}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                  {t("view.emptyDesc")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
