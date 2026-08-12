"use client";

import React, { useState } from "react";
import { Zap, LucideIcon } from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { PercentageSelector } from "@/presentation/components/common/percentage-selector";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export interface AmountActionInfoRow {
  label: string;
  value: string;
  colorClass?: string;
  isBold?: boolean;
}

interface AmountActionDialogProps {
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
  onClose: () => void;
  onConfirm: (amount: number) => Promise<void> | void;
}

function AmountActionForm({
  unitLabel,
  maxAmount,
  step = 1,
  confirmLabel,
  colorVariant = "gdp",
  icon: Icon = Zap,
  infoRows = [],
  warningText,
  emptyStateText = "امکان انجام این عملیات با شرایط فعلی وجود ندارد.",
  onClose,
  onConfirm,
}: Omit<AmountActionDialogProps, "isOpen" | "title" | "subtitle">) {
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

  const handlePercentageSelect = (pct: number) => {
    if (safeMax <= 0) return;
    const target = Math.max(step, Math.floor((safeMax * pct) / step) * step);
    setAmount(target);
  };

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

  const getButtonBg = () => {
    switch (colorVariant) {
      case "military":
        return "bg-military hover:bg-military/90 shadow-military/20 text-primary-foreground";
      case "primary":
        return "bg-primary hover:bg-primary/90 shadow-primary/20 text-primary-foreground";
      case "treasury":
        return "bg-amber-500 hover:bg-amber-500/90 shadow-amber-500/20 text-primary-foreground";
      case "gdp":
      default:
        return "bg-gdp hover:bg-gdp/90 shadow-gdp/20 text-primary-foreground";
    }
  };

  return (
    <div className="space-y-4 text-right dir-rtl font-sans">
      <div className="space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-sans text-[11px]">
            حداکثر سقف مجاز:
          </span>
          <span className="font-bold text-foreground text-xs font-mono">
            {PersianNumberFormatter.formatNumberWithCommas(safeMax)} {unitLabel}
          </span>
        </div>

        <div className="space-y-2 bg-background/40 p-3.5 rounded-2xl border border-border/60">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-sans">
              مقدار درخواستی:
            </span>
            <span className="font-bold text-foreground text-sm font-mono">
              {PersianNumberFormatter.formatNumberWithCommas(currentAmount)}{" "}
              {unitLabel}
            </span>
          </div>

          <input
            type="range"
            min={safeMax > 0 ? step : 0}
            max={Math.max(0, safeMax)}
            step={step}
            disabled={safeMax === 0}
            value={currentAmount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full cursor-pointer h-2 bg-secondary rounded-lg accent-emerald-500 disabled:opacity-30"
          />

          <PercentageSelector
            disabled={safeMax === 0}
            onSelect={handlePercentageSelect}
            colorVariant={colorVariant}
          />
        </div>

        {infoRows.length > 0 && (
          <div className="bg-secondary/40 p-3.5 rounded-2xl space-y-2 text-[11px] border border-border/60 font-sans">
            {infoRows.map((row, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center font-mono"
              >
                <span className="text-muted-foreground font-sans">
                  {row.label}
                </span>
                <span
                  className={`${row.isBold ? "font-bold text-xs" : ""} ${row.colorClass || "text-foreground"}`}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {warningText && (
          <div className="p-3 bg-secondary/60 border border-border/60 rounded-xl text-[10px] text-muted-foreground font-sans">
            {warningText}
          </div>
        )}
      </div>

      <button
        onClick={handleExecute}
        disabled={safeMax === 0 || currentAmount <= 0 || isSubmitting}
        className={`w-full py-3.5 rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 disabled:bg-secondary disabled:text-muted-foreground disabled:shadow-none ${getButtonBg()}`}
      >
        <Icon size={15} />
        <span>
          {safeMax === 0
            ? emptyStateText
            : isSubmitting
              ? "در حال ثبت دستور..."
              : `${confirmLabel} (${PersianNumberFormatter.formatNumberWithCommas(currentAmount)} ${unitLabel})`}
        </span>
      </button>
    </div>
  );
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
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </UnifiedModalShell>
  );
}
