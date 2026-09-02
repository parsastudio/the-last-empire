import React from "react";
import {
  Sparkles,
  ShieldAlert,
  SlidersHorizontal,
  LucideIcon,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  GovernmentTraitConfig,
  PersianNumberFormatter,
} from "@geopolitics/domain";

interface GovernmentTraitDetailsCardProps {
  trait: GovernmentTraitConfig;
  icon: LucideIcon;
}

export function GovernmentTraitDetailsCard({
  trait,
  icon: Icon,
}: GovernmentTraitDetailsCardProps) {
  const formatMultiplierPercent = (
    mult: number,
  ): { text: string; isPositive: boolean } => {
    const diff = Math.round((mult - 1) * 100);
    if (diff === 0) return { text: "پایه (بدون تغییر)", isPositive: true };
    const sign = diff > 0 ? "+" : "";
    return {
      text: `${sign}${PersianNumberFormatter.toPersianDigits(diff)}٪`,
      isPositive: diff < 0,
    };
  };

  const procurementDiff = formatMultiplierPercent(
    trait.modifiers.procurementCostMultiplier,
  );
  const maintenanceDiff = formatMultiplierPercent(
    trait.modifiers.maintenanceCostMultiplier,
  );
  const researchDiff = formatMultiplierPercent(
    trait.modifiers.militaryResearchCostMultiplier,
  );
  const peaceRecoveryDiff = formatMultiplierPercent(
    trait.modifiers.peaceStabilityRecoveryMultiplier,
  );

  return (
    <div className="p-5 rounded-3xl bg-card/95 border border-primary/40 shadow-2xl backdrop-blur-2xl space-y-4.5 animate-fade-smooth dir-rtl text-right font-sans relative overflow-hidden ring-1 ring-white/5">
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shrink-0 shadow-inner">
            <Icon size={22} className="animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-foreground">
                شناسنامه و دکترین: {trait.nameFa}
              </h3>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">
              {trait.headlineFa}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold bg-gdp/10 text-gdp border border-gdp/30 px-2.5 py-1 rounded-xl w-fit">
          ماتریس متوازن حاکمیتی (Zero-Sum)
        </span>
      </div>

      <div className="bg-background/60 border border-border/70 p-3.5 rounded-2xl text-xs text-foreground/90 leading-relaxed font-sans shadow-inner">
        {trait.descriptionFa}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="space-y-2 bg-gdp/5 border border-gdp/25 p-3.5 rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs font-black text-gdp">
            <Sparkles size={14} />
            <span>
              مزایای استراتژیک و نقاط قوت (
              {PersianNumberFormatter.toPersianDigits(trait.prosFa.length)})
            </span>
          </div>
          <div className="space-y-2 pt-1">
            {trait.prosFa.map((pro, idx) => (
              <div
                key={idx}
                className="bg-card/80 border border-gdp/30 p-2.5 rounded-xl flex items-start gap-2 text-[11px] text-foreground font-medium shadow-sm"
              >
                <CheckCircle2 size={14} className="text-gdp shrink-0 mt-0.5" />
                <span className="leading-relaxed">{pro}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 bg-rose-500/5 border border-rose-500/25 p-3.5 rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs font-black text-rose-400">
            <ShieldAlert size={14} />
            <span>
              هزینه‌ها و چالش‌های حاکمیتی (
              {PersianNumberFormatter.toPersianDigits(trait.consFa.length)})
            </span>
          </div>
          <div className="space-y-2 pt-1">
            {trait.consFa.map((con, idx) => (
              <div
                key={idx}
                className="bg-card/80 border border-rose-500/30 p-2.5 rounded-xl flex items-start gap-2 text-[11px] text-foreground font-medium shadow-sm"
              >
                <AlertTriangle
                  size={14}
                  className="text-rose-400 shrink-0 mt-0.5"
                />
                <span className="leading-relaxed">{con}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase font-mono px-1">
          <SlidersHorizontal size={12} className="text-primary" />
          <span>ضرایب اختصاصی و تعدیل‌های آماری این نظام</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
          <div className="bg-secondary/60 border border-border/60 p-2.5 rounded-xl space-y-0.5">
            <span className="text-muted-foreground font-sans block text-[9px]">
              هزینه خرید ادوات:
            </span>
            <span
              className={`font-black text-xs block ${procurementDiff.isPositive ? "text-gdp" : "text-rose-400"}`}
            >
              {procurementDiff.text}
            </span>
          </div>

          <div className="bg-secondary/60 border border-border/60 p-2.5 rounded-xl space-y-0.5">
            <span className="text-muted-foreground font-sans block text-[9px]">
              نگهداری ماهانه ارتش:
            </span>
            <span
              className={`font-black text-xs block ${maintenanceDiff.isPositive ? "text-gdp" : "text-rose-400"}`}
            >
              {maintenanceDiff.text}
            </span>
          </div>

          <div className="bg-secondary/60 border border-border/60 p-2.5 rounded-xl space-y-0.5">
            <span className="text-muted-foreground font-sans block text-[9px]">
              هزینه تحقیقات (R&D):
            </span>
            <span
              className={`font-black text-xs block ${researchDiff.isPositive ? "text-gdp" : "text-rose-400"}`}
            >
              {researchDiff.text}
            </span>
          </div>

          <div className="bg-secondary/60 border border-border/60 p-2.5 rounded-xl space-y-0.5">
            <span className="text-muted-foreground font-sans block text-[9px]">
              شتاب ثبات در صلح:
            </span>
            <span className="font-black text-xs block text-primary">
              {peaceRecoveryDiff.text}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
