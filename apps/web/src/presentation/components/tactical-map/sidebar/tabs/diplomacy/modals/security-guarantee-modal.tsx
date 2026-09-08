"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Coins,
  CheckCircle2,
  XCircle,
  Scale,
  Loader2,
  Users2,
  Swords,
} from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import {
  SecurityGuaranteeValidationResult,
  PersianNumberFormatter,
} from "@geopolitics/domain";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

interface SecurityGuaranteeModalProps {
  isOpen: boolean;
  targetName: string;
  targetFlagCode?: string;
  targetNationId: string;
  isWar: boolean;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const flagEmoji = getFlagEmoji(targetFlagCode || targetNationId);

  const conditions = [
    {
      id: "gdp",
      title: "نسبت تولید ناخالص ملی (GDP)",
      desc: "تولید ناخالص کشور ضامن باید بین ۰.۷ تا ۵ برابر کشور شما باشد.",
      currentValue: `${PersianNumberFormatter.toPersianDigits(validation.gdpRatio)}x برابری`,
      isValid: validation.isGdpValid,
      icon: Scale,
    },
    {
      id: "slots",
      title: "سقف پیمان‌های دفاعی کشور",
      desc: "هر کشور حداکثر مجاز به بستن ۲ پیمان دفاعی فعال است.",
      currentValue: validation.hasSlotAvailable
        ? "ظرفیت آزاد موجود است"
        : "سقف ۲ پیمان تکمیل است",
      isValid: validation.hasSlotAvailable,
      icon: Users2,
    },
    {
      id: "cost",
      title: "حق تعهد امنیتی یک‌باره",
      desc: "پرداخت یک‌باره ۱٪ از کل GDP کشور حامی به خزانه آن.",
      currentValue: validation.canAffordCost
        ? "موجودی خزانه کافی است"
        : "کسری موجودی خزانه",
      isValid: validation.canAffordCost,
      icon: Coins,
    },
    {
      id: "peace",
      title: "عدم تخاصم و برقراری صلح",
      desc: "نباید هیچ حالت جنگی فعالی بین دو کشور برقرار باشد.",
      currentValue: validation.isNotWar
        ? "صلح برقرار است"
        : "وضعیت جنگی متخاصم",
      isValid: validation.isNotWar,
      icon: Swords,
    },
  ];

  const handleSign = async () => {
    if (!validation.isValid || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onConfirmGuarantee();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title="پیمان دفاعی و امنیت سرزمینی متقابل"
      subtitle={`پیش‌نویس توافق‌نامه تعهد دفاعی با امپراتوری ${targetName}`}
      maxWidthClass="max-w-xl"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl font-sans pb-1">
        <div className="bg-gradient-to-r from-cyan-950/40 via-card to-blue-950/30 border border-cyan-500/40 p-4 rounded-3xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center text-3xl shadow-inner select-none shrink-0">
              {flagEmoji}
            </div>
            <div className="space-y-0.5">
              <span className="text-sm font-black text-foreground block">
                {targetName}
              </span>
              <span className="text-[10px] text-cyan-300 font-mono font-bold">
                قدرت ضامن دفاعی (تعهد ورود مستقیم به جنگ)
              </span>
            </div>
          </div>

          <div className="text-left font-mono bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1.5 rounded-2xl">
            <span className="text-[9px] text-muted-foreground block font-sans">
              حق تعهد یک‌باره (۱٪ GDP ضامن):
            </span>
            <span className="text-xs font-black text-cyan-300 flex items-center gap-1 justify-end">
              <Coins size={12} />
              {PersianNumberFormatter.formatCurrency(signingCost, true)}
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-background/50 border border-border/70 rounded-2xl flex items-start gap-2.5 text-xs text-foreground/90 leading-relaxed shadow-inner">
          <ShieldCheck size={18} className="text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground">
            با امضای این پیمان، در صورت هرگونه تهاجم یا اعلان جنگ دشمن علیه خاک
            شما، ارتش امپراتوری{" "}
            <strong className="text-foreground font-black">{targetName}</strong>{" "}
            به طور خودکار و مستقیم وارد جنگ علیه متهاجم خواهد شد. این رابطه
            یک‌طرفه بوده و تعهد متقابلی برای شرکت شما در جنگ‌های هجومی حامی
            ایجاد نمی‌کند.
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider font-mono px-1 block">
            چک‌لیست احراز شروط پیمان دفاعی
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
                      وضعیت:
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

        <div className="pt-2">
          <button
            onClick={handleSign}
            disabled={!validation.isValid || isSubmitting}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-secondary disabled:text-muted-foreground text-white rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-cyan-600/20 hover:scale-[1.005] active:scale-[0.995] border border-cyan-400/40"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ShieldCheck size={16} />
            )}
            <span>
              {isSubmitting
                ? "در حال پرداخت هزینه و امضای پیمان دفاعی..."
                : validation.isValid
                  ? `امضای رسمی پیمان دفاعی با ${targetName}`
                  : "عدم احراز شرایط پیمان دفاعی"}
            </span>
          </button>
        </div>
      </div>
    </UnifiedModalShell>
  );
}
