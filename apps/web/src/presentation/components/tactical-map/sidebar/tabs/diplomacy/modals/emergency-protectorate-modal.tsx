"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Skull, Award, Scale, Globe, Flame } from "lucide-react";
import { SecurityGuaranteeValidationResult } from "@geopolitics/domain";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";
import {
  DiplomaticPactChecklistModal,
  DiplomaticPactCondition,
} from "./components/diplomatic-pact-checklist-modal";

interface EmergencyProtectorateModalProps {
  isOpen: boolean;
  targetName: string;
  targetFlagCode?: string;
  targetNationId: string;
  costPerTurn: number;
  validation: SecurityGuaranteeValidationResult;
  onConfirmProtectorate: () => Promise<void> | void;
  onClose: () => void;
}

export function EmergencyProtectorateModal({
  isOpen,
  targetName,
  targetFlagCode,
  targetNationId,
  costPerTurn,
  validation,
  onConfirmProtectorate,
  onClose,
}: EmergencyProtectorateModalProps) {
  const t = useTranslations("diplomacy.protectorateModal");
  const tErrors = useTranslations("diplomacy.validationErrors");
  const tCommon = useTranslations("common");
  const { formatCurrency, toDigits } = useLocaleFormatter();

  if (!isOpen) return null;

  const flagEmoji = getFlagEmoji(targetFlagCode || targetNationId);

  const conditions: DiplomaticPactCondition[] = [
    {
      id: "gdp",
      title: t("gdpTitle"),
      desc: t("gdpDesc"),
      currentValue: `${toDigits(validation.gdpRatio)}x`,
      isValid: validation.isGdpValid,
      icon: Scale,
    },
    {
      id: "tech",
      title: t("techTitle"),
      desc: t("techDesc"),
      currentValue:
        validation.techDiff > 0
          ? t("techAdvantage", { points: toDigits(validation.techDiff) })
          : t("noTechAdvantage"),
      isValid: validation.isTechValid,
      icon: Award,
    },
    {
      id: "tension",
      title: t("tensionTitle"),
      desc: t("tensionDesc"),
      currentValue: `${toDigits(validation.tension)}%`,
      isValid: validation.isTensionValid,
      icon: Globe,
    },
    {
      id: "peace",
      title: t("peaceTitle"),
      desc: t("peaceDesc"),
      currentValue: validation.isNotWar
        ? t("noDirectWar")
        : t("directWarActive"),
      isValid: validation.isNotWar,
      icon: Flame,
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
      roleLabel={t("protectorRole")}
      costLabel={t("tributeLabel")}
      costFormatted={formatCurrency(costPerTurn, true)}
      calloutIcon={Skull}
      calloutTitle={t("consequencesTitle")}
      calloutDescription={t("consequencesDesc")}
      calloutContainerClass="bg-rose-950/20 border-rose-500/30"
      checklistTitle={t("checklistTitle")}
      statusLabel={t("currentStatus")}
      conditions={conditions}
      cancelLabel={tCommon("cancel")}
      submitLabel={
        validation.isValid
          ? t("signButton", { name: targetName })
          : validationReason
      }
      submittingLabel={t("submitting")}
      submitIcon={Skull}
      isSubmitDisabled={!validation.isValid}
      submitButtonClass="bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20 border border-rose-500/40"
      bannerGradientClass="bg-gradient-to-r from-rose-950/50 via-card to-amber-950/40"
      bannerBorderClass="border-rose-500/50"
      bannerTextClass="text-rose-400"
      onClose={onClose}
      onSubmit={onConfirmProtectorate}
    />
  );
}
