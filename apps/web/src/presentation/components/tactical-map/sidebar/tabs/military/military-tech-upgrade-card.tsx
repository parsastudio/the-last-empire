"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Award } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { ResearchManager } from "@/engine/politics/research-manager";
import { TechProgressionUtility } from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";
import { TacticalTechProgressCard } from "@/presentation/components/common/tactical-tech-progress-card";

interface MilitaryTechUpgradeCardProps {
  nationId: string;
  treasury?: number;
  techLevel?: number;
  governmentType?: string;
}

export function MilitaryTechUpgradeCard({
  nationId,
  treasury = 0,
  techLevel = 1.0,
  governmentType,
}: MilitaryTechUpgradeCardProps) {
  const t = useTranslations("overview.militaryTechUpgrade");
  const { formatCurrency, formatLevel, formatPercent } = useLocaleFormatter();
  const { dispatchAction } = useGameActions();
  const [isSubmittingTech, setIsSubmittingTech] = useState(false);

  const stepResearchCost = ResearchManager.getMilitaryTechCost(
    techLevel,
    governmentType,
  );
  const canAffordTech = treasury >= stepResearchCost;

  const nextStepLevel = TechProgressionUtility.getNextStepLevel(techLevel);
  const subLevelIndex = TechProgressionUtility.getSubLevelIndex(techLevel);
  const progressPercent = TechProgressionUtility.getProgressPercent(techLevel);

  const handleInvestTech = async () => {
    if (!canAffordTech || isSubmittingTech) return;
    try {
      setIsSubmittingTech(true);
      const action = ActionFactory.investResearch(nationId);
      await dispatchAction(action);
    } finally {
      setIsSubmittingTech(false);
    }
  };

  return (
    <TacticalTechProgressCard
      title={t("title")}
      levelBadgeText={t("levelBadge", { level: formatLevel(techLevel) })}
      stepCostLabel={t("stepCost")}
      stepCostFormatted={formatCurrency(stepResearchCost, true)}
      progressToNextLabel={t("progressToNext")}
      progressPercentFormatted={formatPercent(progressPercent)}
      subLevelIndex={subLevelIndex}
      upgradeBtnText={t("upgradeBtn", { level: formatLevel(nextStepLevel) })}
      insufficientFundsText={t("insufficientFunds")}
      submittingText={t("submitting")}
      canAfford={canAffordTech}
      isSubmitting={isSubmittingTech}
      colorVariant="amber"
      icon={Award}
      onUpgrade={handleInvestTech}
    />
  );
}
