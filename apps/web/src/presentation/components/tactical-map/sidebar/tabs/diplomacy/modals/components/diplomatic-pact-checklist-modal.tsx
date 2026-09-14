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

export interface DiplomaticPactConcession {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  variant: "negative" | "positive" | "warning";
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
  concessionsTitle?: string;
  concessions?: DiplomaticPactConcession[];
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
  concessionsTitle,
  concessions,
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
      <div className="space-y-3.5 text-start font-sans pb-1">
        <div
          className={`p-3.5 rounded-2xl flex items-center justify-between shadow-md border ${bannerGradientClass} ${bannerBorderClass}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-secondary/80 border border-border/80 flex items-center justify-center text-2xl shadow-inner select-none shrink-0">
              {targetFlagEmoji}
            </div>
            <div className="space-y-0.5 min-w-0">
              <span className="text-sm font-black text-foreground block truncate">
                {targetName}
              </span>
              <span
                className={`text-[10px] font-mono font-bold ${bannerTextClass} block truncate`}
              >
                {roleLabel}
              </span>
            </div>
          </div>

          <div
            className={`text-end font-mono px-3 py-1.5 rounded-xl border ${bannerBorderClass} bg-secondary/60 shrink-0`}
          >
            <span className="text-[9px] text-muted-foreground block font-sans">
              {costLabel}
            </span>
            <span
              className={`text-xs font-black flex items-center gap-1 justify-end ${bannerTextClass}`}
            >
              <Coins size={12} />
              <span>{costFormatted}</span>
            </span>
          </div>
        </div>

        {concessions && concessions.length > 0 && (
          <div className="space-y-1.5">
            {concessionsTitle && (
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider font-mono px-1 block">
                {concessionsTitle}
              </span>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {concessions.map((c) => {
                const Icon = c.icon;
                const styleClass =
                  c.variant === "positive"
                    ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400"
                    : c.variant === "warning"
                      ? "bg-amber-500/10 border-amber-500/35 text-amber-300"
                      : "bg-rose-500/10 border-rose-500/35 text-rose-400";
                return (
                  <div
                    key={c.id}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1.5 min-h-[64px] ${styleClass}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-medium font-sans min-w-0 opacity-90">
                      <Icon size={13} className="shrink-0" />
                      <span className="truncate">{c.label}</span>
                    </div>
                    <span className="font-bold text-xs font-mono break-words leading-tight">
                      {c.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div
          className={`p-3 rounded-xl flex items-start gap-2 text-xs text-foreground/90 leading-relaxed border ${calloutContainerClass}`}
        >
          <CalloutIcon size={16} className="shrink-0 mt-0.5 text-primary" />
          <div className="space-y-0.5">
            {calloutTitle && (
              <span className="font-bold text-xs block text-foreground">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {conditions.map((cond) => {
              const Icon = cond.icon;
              return (
                <div
                  key={cond.id}
                  className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between gap-1.5 ${
                    cond.isValid
                      ? "bg-card/90 border-emerald-500/40 shadow-sm"
                      : "bg-card/50 border-rose-500/40 opacity-80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Icon
                        size={13}
                        className={
                          cond.isValid
                            ? "text-emerald-400 shrink-0"
                            : "text-rose-400 shrink-0"
                        }
                      />
                      <span className="text-xs font-bold text-foreground truncate">
                        {cond.title}
                      </span>
                    </div>

                    {cond.isValid ? (
                      <CheckCircle2
                        size={15}
                        className="text-emerald-400 shrink-0"
                      />
                    ) : (
                      <XCircle size={15} className="text-rose-400 shrink-0" />
                    )}
                  </div>

                  <p className="text-[10px] text-muted-foreground leading-normal">
                    {cond.desc}
                  </p>

                  <div className="pt-1 border-t border-border/40 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground font-sans text-[9px]">
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

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="sm:col-span-4 py-3 bg-secondary hover:bg-secondary/80 border border-border text-foreground rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{cancelLabel}</span>
          </button>

          <button
            type="button"
            onClick={handleAction}
            disabled={isSubmitDisabled || isSubmitting}
            className={`sm:col-span-8 py-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:scale-[1.005] active:scale-[0.995] disabled:bg-secondary disabled:text-muted-foreground disabled:shadow-none ${submitButtonClass}`}
          >
            {isSubmitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <SubmitIcon size={15} />
            )}
            <span>{isSubmitting ? submittingLabel : submitLabel}</span>
          </button>
        </div>
      </div>
    </UnifiedModalShell>
  );
}
