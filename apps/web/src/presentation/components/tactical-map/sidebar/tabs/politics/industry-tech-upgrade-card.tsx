"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Factory } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import {
  IndustryCalculator,
  TechProgressionUtility,
} from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";
import { TacticalTechProgressCard } from "@/presentation/components/common/tactical-tech-progress-card";

interface IndustryTechUpgradeCardProps {
  nationId: string;
  treasury?: number;
  industrialLevel?: number;
  governmentType?: string;
}

export function IndustryTechUpgradeCard({
  nationId,
  treasury = 100000,
  industrialLevel = 1.0,
  governmentType,
}: IndustryTechUpgradeCardProps) {
  const t = useTranslations("industry.techUpgrade");
  const { formatCurrency, formatPercent, formatLevel } = useLocaleFormatter();
  const { dispatchAction } = useGameActions();
  const [isSubmittingTech, setIsSubmittingTech] = useState(false);

  const stepResearchCost = IndustryCalculator.calculateResearchStepCost(
    industrialLevel,
    governmentType,
  );
  const canAffordTech = treasury >= stepResearchCost;

  const nextStepLevel =
    TechProgressionUtility.getNextStepLevel(industrialLevel);
  const subLevelIndex =
    TechProgressionUtility.getSubLevelIndex(industrialLevel);
  const progressPercent =
    TechProgressionUtility.getProgressPercent(industrialLevel);

  const handleInvestTech = async () => {
    if (!canAffordTech || isSubmittingTech) return;
    try {
      setIsSubmittingTech(true);
      const action = ActionFactory.investIndustrialResearch(nationId);
      await dispatchAction(action);
    } finally {
      setIsSubmittingTech(false);
    }
  };

  return (
    <TacticalTechProgressCard
      title={t("title")}
      levelBadgeText={formatLevel(industrialLevel)}
      stepCostLabel={t("stepCostLabel")}
      stepCostFormatted={formatCurrency(stepResearchCost, true)}
      progressToNextLabel={t("progressToNext")}
      progressPercentFormatted={formatPercent(progressPercent)}
      subLevelIndex={subLevelIndex}
      upgradeBtnText={t("upgradeBtn", { level: formatLevel(nextStepLevel) })}
      insufficientFundsText={t("insufficientFunds")}
      submittingText={t("submitting")}
      canAfford={canAffordTech}
      isSubmitting={isSubmittingTech}
      colorVariant="gdp"
      icon={Factory}
      onUpgrade={handleInvestTech}
    />
  );
}
