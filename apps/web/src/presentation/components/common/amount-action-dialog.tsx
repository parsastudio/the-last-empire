"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { AmountActionForm } from "./amount-action-form";

export interface AmountActionDialogProps {
  isOpen: boolean;
  title: string;
  subtitle?: React.ReactNode;
  unitLabel: string;
  maxAmount: number;
  step?: number;
  confirmLabel: string;
  colorVariant?: "gdp" | "military" | "primary" | "treasury";
  icon?: LucideIcon;
  emptyStateText?: string;
  submittingText?: string;
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
  emptyStateText,
  submittingText,
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
        emptyStateText={emptyStateText}
        submittingText={submittingText}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </UnifiedModalShell>
  );
}
