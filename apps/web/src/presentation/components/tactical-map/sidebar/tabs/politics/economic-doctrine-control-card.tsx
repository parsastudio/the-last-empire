"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Coins, Zap, Anchor, Compass, CheckCircle2 } from "lucide-react";
import { Nation, Province, EconomicDoctrineStance } from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { selectEconomicDoctrinePreview } from "@/presentation/selectors/politics-view-model.selector";
import { EconomicDoctrineListSelector } from "./components/economic-doctrine-list-selector";
import { EconomicRevenuePreviewBox } from "./components/economic-revenue-preview-box";
import { TacticalSound } from "@/presentation/utils/tactical-sound";

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
  const t = useTranslations("politics");
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

  const handleSelectStance = (stance: EconomicDoctrineStance) => {
    TacticalSound.playUiClick();
    setSelectedStance(stance);
  };

  const handleApplyDoctrine = async () => {
    if (!isChanged || isSubmitting) return;
    const action = ActionFactory.setEconomicDoctrine(nation.id, selectedStance);
    await dispatchAction(action);
  };

  const doctrineName = t(`doctrines.${selectedStance}.name`);

  return (
    <div className="space-y-3 font-sans text-start">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Coins size={14} className="text-gdp" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {previewModel.hasSeaAccess ? (
            <span className="text-[9px] font-bold font-sans text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Anchor size={10} />
              <span>{t("seaAccess")}</span>
            </span>
          ) : (
            <span className="text-[9px] font-bold font-sans text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Compass size={10} />
              <span>{t("landlocked")}</span>
            </span>
          )}
        </div>
      </div>

      <div className="bg-background/40 border border-border/80 p-4 rounded-3xl space-y-4 shadow-sm">
        <EconomicDoctrineListSelector
          currentStance={currentStance}
          selectedStance={selectedStance}
          onSelectStance={handleSelectStance}
        />

        <EconomicRevenuePreviewBox
          preview={preview}
          activeConfig={activeConfig}
          gdpPercentage={previewModel.gdpPercentage}
        />

        <button
          type="button"
          onClick={handleApplyDoctrine}
          disabled={!isChanged || isSubmitting}
          className="w-full py-3.5 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl text-xs font-black transition-all shadow-md shadow-gdp/20 cursor-pointer flex items-center justify-center gap-2 border border-gdp/30"
        >
          {isSubmitting ? (
            <span>{t("enactingDoctrine")}</span>
          ) : !isChanged ? (
            <>
              <CheckCircle2 size={15} />
              <span>{t("currentDoctrineEnacted")}</span>
            </>
          ) : (
            <>
              <Zap size={15} />
              <span>{t("enactDoctrineAction", { name: doctrineName })}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
