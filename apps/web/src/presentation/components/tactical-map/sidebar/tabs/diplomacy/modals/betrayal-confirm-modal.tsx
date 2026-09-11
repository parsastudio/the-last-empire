import React from "react";
import { useTranslations } from "next-intl";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface BetrayalConfirmModalProps {
  isOpen: boolean;
  targetName: string;
  penalty: number;
  skippedSteps: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function BetrayalConfirmModal({
  isOpen,
  targetName,
  penalty,
  skippedSteps,
  onClose,
  onConfirm,
}: BetrayalConfirmModalProps) {
  const t = useTranslations("diplomacy.betrayal");

  if (!isOpen) return null;

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={t("title")}
      subtitle={t("subtitle", { name: targetName })}
      maxWidthClass="max-w-md"
      zIndexClass="z-[60]"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl font-sans">
        <div className="p-3.5 bg-military/15 border border-military/40 rounded-2xl flex items-start gap-3">
          <ShieldAlert size={20} className="text-military shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-military block">
              {t("penaltySteps", {
                steps: PersianNumberFormatter.toPersianDigits(skippedSteps),
              })}
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t("desc")}
            </p>
          </div>
        </div>

        <div className="bg-secondary/40 border border-border/60 p-4 rounded-2xl space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-sans text-[11px]">
              {t("reputationPenalty")}
            </span>
            <span className="font-bold text-military text-sm">
              {t("points", {
                points: PersianNumberFormatter.toPersianDigits(penalty),
              })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={onClose}
            className="py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-2xl text-xs font-bold transition-all border border-border cursor-pointer"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="py-3 bg-military hover:bg-military/90 text-primary-foreground rounded-2xl text-xs font-bold transition-all shadow-lg shadow-military/10 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <AlertTriangle size={14} />
            <span>{t("confirm")}</span>
          </button>
        </div>
      </div>
    </UnifiedModalShell>
  );
}
