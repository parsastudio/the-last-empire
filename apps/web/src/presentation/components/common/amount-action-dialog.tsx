"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { AmountActionForm, AmountActionInfoRow } from "./amount-action-form";

export type { AmountActionInfoRow };

export interface AmountActionDialogProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  unitLabel: string;
  maxAmount: number;
  step?: number;
  confirmLabel: string;
  colorVariant?: "gdp" | "military" | "primary" | "treasury";
  icon?: LucideIcon;
  infoRows?: AmountActionInfoRow[];
  warningText?: string;
  emptyStateText?: string;
  submittingText?: string;
  ceilingLabel?: string;
  requestedLabel?: string;
  onClose: () => void;
  onConfirm: (amount: number) => Promise<void> | void;
}

export function AmountActionDialog({
  isOpen,
  title,
  subtitle,
  unitLabel,
  maxAmount,
  step,
  confirmLabel,
  colorVariant,
  icon,
  infoRows,
  warningText,
  emptyStateText,
  submittingText,
  ceilingLabel,
  requestedLabel,
  onClose,
  onConfirm,
}: AmountActionDialogProps) {
  if (!isOpen) return null;

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={title}
      subtitle={subtitle}
      maxWidthClass="max-w-md"
      zIndexClass="z-[60]"
      onClose={onClose}
    >
      <AmountActionForm
        key={`${title}-${maxAmount}`}
        unitLabel={unitLabel}
        maxAmount={maxAmount}
        step={step}
        confirmLabel={confirmLabel}
        colorVariant={colorVariant}
        icon={icon}
        infoRows={infoRows}
        warningText={warningText}
        emptyStateText={emptyStateText}
        submittingText={submittingText}
        ceilingLabel={ceilingLabel}
        requestedLabel={requestedLabel}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </UnifiedModalShell>
  );
}
