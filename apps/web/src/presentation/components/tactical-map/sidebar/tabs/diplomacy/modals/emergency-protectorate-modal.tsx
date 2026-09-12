"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Skull,
  Coins,
  CheckCircle2,
  XCircle,
  Award,
  Scale,
  Loader2,
  Globe,
  Flame,
} from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { SecurityGuaranteeValidationResult } from "@geopolitics/domain";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

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
  const tCommon = useTranslations("common");
  const { formatCurrency, toDigits } = useLocaleFormatter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const flagEmoji = getFlagEmoji(targetFlagCode || targetNationId);

  const conditions = [
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

  const handleSign = async () => {
    if (!validation.isValid || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onConfirmProtectorate();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={t("title")}
      subtitle={t("subtitle", { name: targetName })}
      maxWidthClass="max-w-xl"
      zIndexClass="z-[60]"
      onClose={onClose}
    >
      <div className="space-y-4 text-start font-sans pb-1">
        <div className="bg-gradient-to-r from-rose-950/50 via-card to-amber-950/40 border border-rose-500/50 p-4 rounded-3xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary/80 border border-rose-500/30 flex items-center justify-center text-3xl shadow-inner select-none shrink-0">
              {flagEmoji}
            </div>
            <div className="space-y-0.5">
              <span className="text-sm font-black text-foreground block">
                {targetName}
              </span>
              <span className="text-[10px] text-rose-300 font-mono font-bold">
                {t("protectorRole")}
              </span>
            </div>
          </div>

          <div className="text-end font-mono bg-rose-500/10 border border-rose-500/30 px-3.5 py-1.5 rounded-2xl">
            <span className="text-[9px] text-muted-foreground block font-sans">
              {t("tributeLabel")}
            </span>
            <span className="text-xs font-black text-rose-400 flex items-center gap-1 justify-end">
              <Coins size={12} />
              {formatCurrency(costPerTurn, true)}
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-2xl space-y-1.5 text-xs shadow-inner">
          <div className="flex items-center gap-2 text-rose-400 font-black">
            <Skull size={16} className="animate-pulse shrink-0" />
            <span>{t("consequencesTitle")}</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t("consequencesDesc")}
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider font-mono px-1 block">
            {t("checklistTitle")}
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
                      {t("currentStatus")}
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
            <span>{tCommon("cancel")}</span>
          </button>

          <button
            type="button"
            onClick={handleSign}
            disabled={!validation.isValid || isSubmitting}
            className="sm:col-span-8 py-3.5 bg-rose-600 hover:bg-rose-500 disabled:bg-secondary disabled:text-muted-foreground text-white rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-rose-600/20 hover:scale-[1.005] active:scale-[0.995] border border-rose-500/40"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Skull size={16} />
            )}
            <span>
              {isSubmitting
                ? t("submitting")
                : validation.isValid
                  ? t("signButton", { name: targetName })
                  : t("invalid")}
            </span>
          </button>
        </div>
      </div>
    </UnifiedModalShell>
  );
}
