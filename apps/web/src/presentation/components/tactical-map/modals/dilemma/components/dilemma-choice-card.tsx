import React from "react";
import {
  Coins,
  Landmark,
  Globe,
  Award,
  Cpu,
  Shield,
  ShieldAlert,
  Crosshair,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { DilemmaChoice, PersianNumberFormatter } from "@geopolitics/domain";

interface DilemmaChoiceCardProps {
  choice: DilemmaChoice;
  choiceIndex: number;
  isSelected: boolean;
  isSubmitting: boolean;
  onExecute: (choiceId: string) => void;
}

export function DilemmaChoiceCard({
  choice,
  choiceIndex,
  isSelected,
  isSubmitting,
  onExecute,
}: DilemmaChoiceCardProps) {
  const effect = choice.effect;

  return (
    <div
      onClick={() => !isSubmitting && onExecute(choice.id)}
      className={`relative p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 font-sans dir-rtl text-right cursor-pointer group backdrop-blur-xl ${
        isSelected
          ? "bg-primary/15 border-primary shadow-xl shadow-primary/20 ring-2 ring-primary/40 scale-[1.01]"
          : "bg-card/90 border-border/80 hover:border-primary/50 hover:bg-secondary/40 shadow-md hover:shadow-xl"
      }`}
    >
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-secondary/80 border border-border/70 flex items-center justify-center text-xs font-mono font-black text-muted-foreground group-hover:text-primary group-hover:border-primary/40 transition-colors">
              {PersianNumberFormatter.toPersianDigits(choiceIndex + 1)}
            </span>
            <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
              {choice.labelFa}
            </h4>
          </div>

          <span
            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/80 group-hover:border-primary/60"
            }`}
          >
            {isSelected && <CheckCircle2 size={13} strokeWidth={3} />}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed font-sans pr-9">
          {choice.descriptionFa}
        </p>
      </div>

      <div className="space-y-3 pt-2 border-t border-border/50">
        <div className="flex flex-wrap gap-1.5 pr-9 font-mono text-[10px]">
          {effect.treasuryDelta !== undefined && effect.treasuryDelta !== 0 && (
            <span
              className={`px-2.5 py-1 rounded-xl border flex items-center gap-1 font-bold ${
                effect.treasuryDelta > 0
                  ? "bg-gdp/15 text-gdp border-gdp/30"
                  : "bg-rose-500/15 text-rose-400 border-rose-500/30"
              }`}
            >
              <Coins size={11} />
              <span>
                {effect.treasuryDelta > 0 ? "+" : ""}
                {PersianNumberFormatter.formatCurrency(
                  effect.treasuryDelta,
                  true,
                )}
              </span>
            </span>
          )}

          {effect.stabilityDelta !== undefined &&
            effect.stabilityDelta !== 0 && (
              <span
                className={`px-2.5 py-1 rounded-xl border flex items-center gap-1 font-bold ${
                  effect.stabilityDelta > 0
                    ? "bg-gdp/15 text-gdp border-gdp/30"
                    : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                }`}
              >
                <Landmark size={11} />
                <span>
                  {effect.stabilityDelta > 0 ? "+" : ""}
                  {PersianNumberFormatter.toPersianDigits(
                    effect.stabilityDelta,
                  )}
                  ٪ ثبات سیاسی
                </span>
              </span>
            )}

          {effect.globalReputationDelta !== undefined &&
            effect.globalReputationDelta !== 0 && (
              <span
                className={`px-2.5 py-1 rounded-xl border flex items-center gap-1 font-bold ${
                  effect.globalReputationDelta > 0
                    ? "bg-gdp/15 text-gdp border-gdp/30"
                    : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                }`}
              >
                <Globe size={11} />
                <span>
                  {effect.globalReputationDelta > 0 ? "+" : ""}
                  {PersianNumberFormatter.toPersianDigits(
                    effect.globalReputationDelta,
                  )}{" "}
                  پرستیژ جهانی
                </span>
              </span>
            )}

          {effect.militaryTechDelta !== undefined &&
            effect.militaryTechDelta !== 0 && (
              <span className="px-2.5 py-1 rounded-xl border bg-amber-500/15 text-amber-300 border-amber-500/30 flex items-center gap-1 font-bold">
                <Award size={11} />
                <span>
                  +
                  {PersianNumberFormatter.toPersianDigits(
                    effect.militaryTechDelta,
                  )}{" "}
                  سطح فناوری نظامی
                </span>
              </span>
            )}

          {effect.industrialLevelDelta !== undefined &&
            effect.industrialLevelDelta !== 0 && (
              <span className="px-2.5 py-1 rounded-xl border bg-emerald-500/15 text-emerald-300 border-emerald-500/30 flex items-center gap-1 font-bold">
                <Cpu size={11} />
                <span>
                  +
                  {PersianNumberFormatter.toPersianDigits(
                    effect.industrialLevelDelta,
                  )}{" "}
                  دانش صنعتی
                </span>
              </span>
            )}

          {effect.infantryDelta !== undefined && effect.infantryDelta !== 0 && (
            <span
              className={`px-2.5 py-1 rounded-xl border flex items-center gap-1 font-bold ${
                effect.infantryDelta > 0
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-rose-500/15 text-rose-400 border-rose-500/30"
              }`}
            >
              <Shield size={11} />
              <span>
                {effect.infantryDelta > 0 ? "+" : ""}
                {PersianNumberFormatter.formatNumberWithCommas(
                  effect.infantryDelta,
                )}{" "}
                پیاده‌نظام
              </span>
            </span>
          )}

          {effect.armorDelta !== undefined && effect.armorDelta !== 0 && (
            <span
              className={`px-2.5 py-1 rounded-xl border flex items-center gap-1 font-bold ${
                effect.armorDelta > 0
                  ? "bg-military/15 text-military border-military/30"
                  : "bg-rose-500/15 text-rose-400 border-rose-500/30"
              }`}
            >
              <ShieldAlert size={11} />
              <span>
                {effect.armorDelta > 0 ? "+" : ""}
                {PersianNumberFormatter.formatNumberWithCommas(
                  effect.armorDelta,
                )}{" "}
                تانک
              </span>
            </span>
          )}

          {effect.airDefenseDelta !== undefined &&
            effect.airDefenseDelta !== 0 && (
              <span
                className={`px-2.5 py-1 rounded-xl border flex items-center gap-1 font-bold ${
                  effect.airDefenseDelta > 0
                    ? "bg-diplomacy/15 text-diplomacy border-diplomacy/30"
                    : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                }`}
              >
                <Crosshair size={11} />
                <span>
                  {effect.airDefenseDelta > 0 ? "+" : ""}
                  {PersianNumberFormatter.formatNumberWithCommas(
                    effect.airDefenseDelta,
                  )}{" "}
                  پدافند
                </span>
              </span>
            )}
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-secondary group-hover:bg-primary group-hover:text-primary-foreground text-foreground rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 border border-border/70 group-hover:border-primary/60 shadow-sm"
        >
          <span>صدور فرمان و اجرای این تصمیم</span>
          <ArrowRight
            size={14}
            className="group-hover:-translate-x-1 transition-transform"
          />
        </button>
      </div>
    </div>
  );
}
