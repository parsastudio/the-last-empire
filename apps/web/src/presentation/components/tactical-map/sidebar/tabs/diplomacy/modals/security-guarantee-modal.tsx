"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, Coins, Scale, Users2, Swords } from "lucide-react";
import { SecurityGuaranteeValidationResult } from "@geopolitics/domain";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";
import {
  DiplomaticPactChecklistModal,
  DiplomaticPactCondition,
} from "./components/diplomatic-pact-checklist-modal";

interface SecurityGuaranteeModalProps {
  isOpen: boolean;
  targetName: string;
  targetFlagCode?: string;
  targetNationId: string;
  signingCost: number;
  validation: SecurityGuaranteeValidationResult;
  onConfirmGuarantee: () => Promise<void> | void;
  onClose: () => void;
}

export function SecurityGuaranteeModal({
  isOpen,
  targetName,
  targetFlagCode,
  targetNationId,
  signingCost,
  validation,
  onConfirmGuarantee,
  onClose,
}: SecurityGuaranteeModalProps) {
  const t = useTranslations("diplomacy.guaranteeModal");
  const tErrors = useTranslations("diplomacy.validationErrors");
  const tCommon = useTranslations("common");
  const { formatCurrency, toDigits } = useLocaleFormatter();

  if (!isOpen) return null;

  const flagEmoji = getFlagEmoji(targetFlagCode || targetNationId);

  const conditions: DiplomaticPactCondition[] = [
    {
      id: "gdp",
      title: t("gdpRatioTitle"),
      desc: t("gdpRatioDesc"),
      currentValue: `${toDigits(validation.gdpRatio)}x`,
      isValid: validation.isGdpValid,
      icon: Scale,
    },
    {
      id: "slots",
      title: t("slotsTitle"),
      desc: t("slotsDesc"),
      currentValue: validation.hasSlotAvailable
        ? t("slotsAvailable")
        : t("slotsFull"),
      isValid: validation.hasSlotAvailable,
      icon: Users2,
    },
    {
      id: "cost",
      title: t("costTitle"),
      desc: t("costDesc"),
      currentValue: validation.canAffordCost
        ? t("costAffordable")
        : t("costDeficit"),
      isValid: validation.canAffordCost,
      icon: Coins,
    },
    {
      id: "peace",
      title: t("peaceTitle"),
      desc: t("peaceDesc"),
      currentValue: validation.isNotWar ? t("peaceActive") : t("warActive"),
      isValid: validation.isNotWar,
      icon: Swords,
    },
  ];

  const validationReason = validation.reasonCode
    ? tErrors(validation.reasonCode)
    : t("invalid");

  return (
    <DiplomaticPactChecklistModal
      isOpen={isOpen}
      title={t("title")}
      subtitle={t("subtitle", { name: targetName })}
      targetName={targetName}
      targetFlagEmoji={flagEmoji}
      roleLabel={t("guarantorRole")}
      costLabel={t("signingCostLabel")}
      costFormatted={formatCurrency(signingCost, true)}
      calloutIcon={ShieldCheck}
      calloutDescription={t("explainer", { name: targetName })}
      checklistTitle={t("checklistTitle")}
      statusLabel={t("status")}
      conditions={conditions}
      cancelLabel={tCommon("cancel")}
      submitLabel={
        validation.isValid
          ? t("signingButton", { name: targetName })
          : validationReason
      }
      submittingLabel={t("submitting")}
      submitIcon={ShieldCheck}
      isSubmitDisabled={!validation.isValid}
      submitButtonClass="bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20 border border-cyan-400/40"
      bannerGradientClass="bg-gradient-to-r from-cyan-950/40 via-card to-blue-950/30"
      bannerBorderClass="border-cyan-500/40"
      bannerTextClass="text-cyan-300"
      onClose={onClose}
      onSubmit={onConfirmGuarantee}
    />
  );
}
