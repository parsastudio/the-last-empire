"use client";

import React, { useState } from "react";
import {
  Coins,
  CheckCircle2,
  XCircle,
  Loader2,
  LucideIcon,
} from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";

export interface DiplomaticPactCondition {
  id: string;
  title: string;
  desc: string;
  currentValue: string;
  isValid: boolean;
  icon: LucideIcon;
}

export interface DiplomaticPactChecklistModalProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  targetName: string;
  targetFlagEmoji: string;
  roleLabel: string;
  costLabel: string;
  costFormatted: string;
  calloutIcon: LucideIcon;
  calloutTitle?: string;
  calloutDescription: string;
  calloutContainerClass?: string;
  checklistTitle: string;
  statusLabel: string;
  conditions: DiplomaticPactCondition[];
  cancelLabel: string;
  submitLabel: string;
  submittingLabel: string;
  submitIcon: LucideIcon;
  isSubmitDisabled: boolean;
  submitButtonClass: string;
  bannerGradientClass: string;
  bannerBorderClass: string;
  bannerTextClass: string;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
}

export function DiplomaticPactChecklistModal({
  isOpen,
  title,
  subtitle,
  targetName,
  targetFlagEmoji,
  roleLabel,
  costLabel,
  costFormatted,
  calloutIcon: CalloutIcon,
  calloutTitle,
  calloutDescription,
  calloutContainerClass = "bg-background/50 border-border/70",
  checklistTitle,
  statusLabel,
  conditions,
  cancelLabel,
  submitLabel,
  submittingLabel,
  submitIcon: SubmitIcon,
  isSubmitDisabled,
  submitButtonClass,
  bannerGradientClass,
  bannerBorderClass,
  bannerTextClass,
  onClose,
  onSubmit,
}: DiplomaticPactChecklistModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAction = async () => {
    if (isSubmitDisabled || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onSubmit();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={title}
      subtitle={subtitle}
      maxWidthClass="max-w-xl"
      zIndexClass="z-[60]"
      onClose={onClose}
    >
      <div className="space-y-4 text-start font-sans pb-1">
        <div
          className={`p-4 rounded-3xl flex items-center justify-between shadow-md border ${bannerGradientClass} ${bannerBorderClass}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center text-3xl shadow-inner select-none shrink-0">
              {targetFlagEmoji}
            </div>
            <div className="space-y-0.5">
              <span className="text-sm font-black text-foreground block">
                {targetName}
              </span>
              <span
                className={`text-[10px] font-mono font-bold ${bannerTextClass}`}
              >
                {roleLabel}
              </span>
            </div>
          </div>

          <div
            className={`text-end font-mono px-3.5 py-1.5 rounded-2xl border ${bannerBorderClass} bg-secondary/40`}
          >
            <span className="text-[9px] text-muted-foreground block font-sans">
              {costLabel}
            </span>
            <span
              className={`text-xs font-black flex items-center gap-1 justify-end ${bannerTextClass}`}
            >
              <Coins size={12} />
              {costFormatted}
            </span>
          </div>
        </div>

        <div
          className={`p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-foreground/90 leading-relaxed shadow-inner border ${calloutContainerClass}`}
        >
          <CalloutIcon size={18} className="shrink-0 mt-0.5 text-primary" />
          <div className="space-y-0.5">
            {calloutTitle && (
              <span className="font-black text-xs block text-foreground">
                {calloutTitle}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {calloutDescription}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider font-mono px-1 block">
            {checklistTitle}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {conditions.map((cond) => {
              const Icon = cond.icon;
              return (
                <div
                  key={cond.id}
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between space-y-2 ${
                    cond.isValid
                      ? "bg-card/90 border-emerald-500/40 shadow-sm"
                      : "bg-card/50 border-rose-500/40 opacity-80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Icon
                        size={14}
                        className={
                          cond.isValid ? "text-emerald-400" : "text-rose-400"
                        }
                      />
                      <span className="text-xs font-bold text-foreground">
                        {cond.title}
                      </span>
                    </div>

                    {cond.isValid ? (
                      <CheckCircle2
                        size={16}
                        className="text-emerald-400 shrink-0"
                      />
                    ) : (
                      <XCircle size={16} className="text-rose-400 shrink-0" />
                    )}
                  </div>

                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {cond.desc}
                  </p>

                  <div className="pt-1 border-t border-border/40 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground font-sans">
                      {statusLabel}
                    </span>
                    <span
                      className={`font-bold ${
                        cond.isValid ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {cond.currentValue}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="sm:col-span-4 py-3.5 bg-secondary hover:bg-secondary/80 border border-border text-foreground rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{cancelLabel}</span>
          </button>

          <button
            type="button"
            onClick={handleAction}
            disabled={isSubmitDisabled || isSubmitting}
            className={`sm:col-span-8 py-3.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl hover:scale-[1.005] active:scale-[0.995] disabled:bg-secondary disabled:text-muted-foreground disabled:shadow-none ${submitButtonClass}`}
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <SubmitIcon size={16} />
            )}
            <span>{isSubmitting ? submittingLabel : submitLabel}</span>
          </button>
        </div>
      </div>
    </UnifiedModalShell>
  );
}
