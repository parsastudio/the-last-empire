"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Zap, LucideIcon } from "lucide-react";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";
import { TacticalRangeSlider } from "@/presentation/components/common/tactical-range-slider";
import {
  ActionColorVariant,
  ActionVariantStyleUtility,
} from "./utils/action-variant-style.utility";

export interface AmountActionFormProps {
  unitLabel: string;
  maxAmount: number;
  step?: number;
  confirmLabel: string;
  colorVariant?: ActionColorVariant;
  icon?: LucideIcon;
  emptyStateText?: string;
  submittingText?: string;
  onClose: () => void;
  onConfirm: (amount: number) => Promise<void> | void;
}

export function AmountActionForm({
  unitLabel,
  maxAmount,
  step = 1,
  confirmLabel,
  colorVariant = "gdp",
  icon: Icon = Zap,
  emptyStateText,
  submittingText,
  onClose,
  onConfirm,
}: AmountActionFormProps) {
  const t = useTranslations("common");
  const { formatNumber } = useLocaleFormatter();
  const safeMax = Math.max(0, maxAmount);
  const initialAmount =
    safeMax <= 0
      ? 0
      : Math.min(
          safeMax,
          Math.max(step, Math.floor((safeMax * 0.25) / step) * step),
        );

  const [amount, setAmount] = useState<number>(initialAmount);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const currentAmount = Math.max(0, Math.min(amount, safeMax));

  const resolvedEmptyStateText = emptyStateText || t("actionUnavailable");
  const resolvedSubmittingText = submittingText || t("submittingOrder");
  const resolvedCeilingLabel = t("maxLimit");
  const resolvedRequestedLabel = t("requestedAmount");

  const handleExecute = async () => {
    if (currentAmount <= 0 || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onConfirm(currentAmount);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonBgClass = ActionVariantStyleUtility.getButtonBg(colorVariant);

  return (
    <div className="space-y-4 text-start font-sans">
      <div className="space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-sans text-[11px]">
            {resolvedCeilingLabel}
          </span>
          <span className="font-bold text-foreground text-xs font-mono">
            {formatNumber(safeMax)} {unitLabel}
          </span>
        </div>

        <div className="space-y-2.5 bg-background/40 p-4 rounded-3xl border border-border/60 shadow-inner">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-sans">
              {resolvedRequestedLabel}
            </span>
            <span className="font-extrabold text-foreground text-sm font-mono bg-secondary/80 px-3 py-1 rounded-xl border border-border/60 shadow-sm">
              {formatNumber(currentAmount)} {unitLabel}
            </span>
          </div>

          <TacticalRangeSlider
            value={currentAmount}
            max={safeMax}
            min={safeMax > 0 ? step : 0}
            step={step}
            disabled={safeMax === 0}
            colorVariant={colorVariant}
            showPercentageSelector={true}
            onChange={setAmount}
          />
        </div>
      </div>

      <button
        onClick={handleExecute}
        disabled={safeMax === 0 || currentAmount <= 0 || isSubmitting}
        className={`w-full py-3.5 rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 disabled:bg-secondary disabled:text-muted-foreground disabled:shadow-none hover:scale-[1.005] active:scale-[0.995] ${buttonBgClass}`}
      >
        <Icon size={15} />
        <span>
          {safeMax === 0
            ? resolvedEmptyStateText
            : isSubmitting
              ? resolvedSubmittingText
              : `${confirmLabel} (${formatNumber(currentAmount)} ${unitLabel})`}
        </span>
      </button>
    </div>
  );
}
