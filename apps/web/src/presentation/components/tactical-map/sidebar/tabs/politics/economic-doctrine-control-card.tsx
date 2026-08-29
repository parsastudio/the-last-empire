import React, { useState, useMemo } from "react";
import {
  Coins,
  Zap,
  Globe2,
  Building2,
  Anchor,
  Compass,
  CheckCircle2,
} from "lucide-react";
import {
  Nation,
  Province,
  EconomicDoctrineStance,
  ECONOMIC_DOCTRINE_CONFIGS,
  ALL_ECONOMIC_DOCTRINES,
} from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { selectEconomicDoctrinePreview } from "@/presentation/selectors/politics-view-model.selector";

interface EconomicDoctrineControlCardProps {
  nation: Nation;
  nationsMap?: Record<string, Nation>;
  provincesMap?: Record<string, Province>;
}

export function EconomicDoctrineControlCard({
  nation,
  nationsMap,
  provincesMap,
}: EconomicDoctrineControlCardProps) {
  const currentStance = nation.economicStance || "BALANCED_MIXED";
  const [selectedStance, setSelectedStance] =
    useState<EconomicDoctrineStance>(currentStance);
  const { dispatchAction, isSubmitting } = useGameActions();

  const previewModel = useMemo(
    () =>
      selectEconomicDoctrinePreview(
        nation,
        selectedStance,
        nationsMap,
        provincesMap,
      ),
    [nation, selectedStance, nationsMap, provincesMap],
  );

  const activeConfig = previewModel.activeConfig;
  const preview = previewModel.preview;
  const isChanged = selectedStance !== currentStance;

  const handleApplyDoctrine = async () => {
    if (!isChanged || isSubmitting) return;
    const action = ActionFactory.setEconomicDoctrine(nation.id, selectedStance);
    await dispatchAction(
      action,
      `دکترین مالی-تجاری کشور به (${activeConfig.nameFa}) تغییر یافت.`,
    );
  };

  return (
    <div className="space-y-3 font-sans dir-rtl text-right">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Coins size={14} className="text-gdp" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            دیوان عواید و دکترین مالی-تجاری
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {previewModel.hasSeaAccess ? (
            <span className="text-[9px] font-bold font-sans text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Anchor size={10} />
              <span>شاهراه دریایی (۱۰۰٪ ترانزیت)</span>
            </span>
          ) : (
            <span className="text-[9px] font-bold font-sans text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Compass size={10} />
              <span>محصور در خشکی (۵۰٪ ترانزیت)</span>
            </span>
          )}
        </div>
      </div>

      <div className="bg-background/40 border border-border/80 p-4 rounded-3xl space-y-4 shadow-sm">
        <div className="grid grid-cols-1 gap-2">
          {ALL_ECONOMIC_DOCTRINES.map((stance) => {
            const config = ECONOMIC_DOCTRINE_CONFIGS[stance];
            const isSelected = selectedStance === stance;
            const isEnacted = currentStance === stance;

            return (
              <button
                key={stance}
                type="button"
                onClick={() => setSelectedStance(stance)}
                className={`w-full p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col gap-1.5 ${
                  isSelected
                    ? "bg-secondary/90 border-primary shadow-md shadow-primary/10 ring-1 ring-primary/40"
                    : "bg-secondary/30 border-border/60 hover:bg-secondary/60 hover:border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-foreground">
                      {config.nameFa}
                    </span>
                    {isEnacted && (
                      <span className="text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-md">
                        سیاست جاری
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-mono font-bold text-muted-foreground bg-background/80 px-2 py-0.5 rounded-md border border-border/50">
                    {config.badgeText}
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {config.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="bg-secondary/50 border border-border/70 p-3.5 rounded-2xl space-y-2.5 font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <span className="text-muted-foreground font-sans font-bold text-[11px]">
              پیش‌بینی درآمد کل هر نوبت:
            </span>
            <span className="text-sm font-black text-gdp font-mono">
              +{PersianNumberFormatter.formatCurrency(preview.totalRevenue)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-background/70 p-2.5 rounded-xl space-y-1 border border-border/50">
              <div className="flex items-center justify-between text-muted-foreground font-sans">
                <span className="flex items-center gap-1">
                  <Building2 size={11} className="text-primary" />
                  <span>تولید و مالیات بومی:</span>
                </span>
                <span className="font-bold text-foreground">
                  {Math.round(activeConfig.domesticWeight * 100)}٪
                </span>
              </div>
              <span className="font-extrabold text-foreground text-xs block">
                {PersianNumberFormatter.formatCurrency(
                  preview.domesticRevenue,
                  true,
                )}
              </span>
            </div>

            <div className="bg-background/70 p-2.5 rounded-xl space-y-1 border border-border/50">
              <div className="flex items-center justify-between text-muted-foreground font-sans">
                <span className="flex items-center gap-1">
                  <Globe2 size={11} className="text-treasury" />
                  <span>شاهراه و ترانزیت جهانی:</span>
                </span>
                <span className="font-bold text-foreground">
                  {Math.round(activeConfig.globalWeight * 100)}٪
                </span>
              </div>
              <span className="font-extrabold text-gdp text-xs block">
                {PersianNumberFormatter.formatCurrency(
                  preview.globalRevenue,
                  true,
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[10px] text-muted-foreground font-sans">
            <span className="text-muted-foreground">وضعیت شبکه بین‌الملل:</span>
            <div className="flex items-center gap-1">
              <span>شرکای صلح:</span>
              <span className="font-bold text-foreground font-mono">
                {PersianNumberFormatter.toPersianDigits(
                  preview.activePeacePartnersCount,
                )}{" "}
                کشور
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleApplyDoctrine}
          disabled={!isChanged || isSubmitting}
          className="w-full py-3.5 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl text-xs font-black transition-all shadow-md shadow-gdp/20 cursor-pointer flex items-center justify-center gap-2 border border-gdp/30"
        >
          {isSubmitting ? (
            <span>در حال ثبت در دیوان عالی...</span>
          ) : !isChanged ? (
            <>
              <CheckCircle2 size={15} />
              <span>دکترین فعلی حاکم بر کشور</span>
            </>
          ) : (
            <>
              <Zap size={15} />
              <span>تصویب و اجرای دکترین ({activeConfig.nameFa})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
