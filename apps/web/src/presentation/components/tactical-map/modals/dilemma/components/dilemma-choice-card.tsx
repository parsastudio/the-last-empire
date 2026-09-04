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
  Radio,
  CheckCircle2,
} from "lucide-react";
import { DilemmaChoice, PersianNumberFormatter } from "@geopolitics/domain";

interface DilemmaChoiceCardProps {
  choice: DilemmaChoice;
  choiceIndex: number;
  isSelected: boolean;
  nationGdp: number;
  onSelect: (choiceId: string) => void;
}

export function DilemmaChoiceCard({
  choice,
  choiceIndex,
  isSelected,
  nationGdp,
  onSelect,
}: DilemmaChoiceCardProps) {
  const effect = choice.effect;

  let moneyVal = effect.treasuryDelta || 0;
  if (
    effect.treasuryGdpPercent !== undefined &&
    effect.treasuryGdpPercent !== 0
  ) {
    moneyVal = Math.floor(nationGdp * effect.treasuryGdpPercent);
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(choice.id)}
      className={`w-full p-4 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-3 font-sans dir-rtl text-right cursor-pointer group backdrop-blur-xl ${
        isSelected
          ? "bg-primary/20 border-primary shadow-xl shadow-primary/20 ring-2 ring-primary/40 scale-[1.01]"
          : "bg-card/90 border-border/80 hover:border-primary/50 hover:bg-secondary/40 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="space-y-1.5 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-xl bg-secondary/80 border border-border/70 flex items-center justify-center text-xs font-mono font-black text-muted-foreground group-hover:text-primary transition-colors shrink-0">
              {PersianNumberFormatter.toPersianDigits(choiceIndex + 1)}
            </span>
            <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
              {choice.labelFa}
            </h4>
          </div>

          <span
            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/80 group-hover:border-primary/60"
            }`}
          >
            {isSelected && <CheckCircle2 size={13} strokeWidth={3} />}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed font-sans pr-8">
          {choice.descriptionFa}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 pr-8 font-mono text-[10px] w-full pt-1 border-t border-border/40">
        {moneyVal !== 0 && (
          <span
            className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 font-bold ${
              moneyVal > 0
                ? "bg-gdp/15 text-gdp border-gdp/30"
                : "bg-rose-500/15 text-rose-400 border-rose-500/30"
            }`}
          >
            <Coins size={11} />
            <span>
              {moneyVal > 0 ? "+" : ""}
              {PersianNumberFormatter.formatCurrency(moneyVal, true)}
            </span>
          </span>
        )}

        {effect.stabilityDelta !== undefined && effect.stabilityDelta !== 0 && (
          <span
            className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 font-bold ${
              effect.stabilityDelta > 0
                ? "bg-gdp/15 text-gdp border-gdp/30"
                : "bg-rose-500/15 text-rose-400 border-rose-500/30"
            }`}
          >
            <Landmark size={11} />
            <span>
              {effect.stabilityDelta > 0 ? "+" : ""}
              {PersianNumberFormatter.toPersianDigits(effect.stabilityDelta)}٪
              ثبات
            </span>
          </span>
        )}

        {effect.globalReputationDelta !== undefined &&
          effect.globalReputationDelta !== 0 && (
            <span
              className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 font-bold ${
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
                پرستیژ
              </span>
            </span>
          )}

        {effect.militaryTechDelta !== undefined &&
          effect.militaryTechDelta !== 0 && (
            <span className="px-2 py-0.5 rounded-lg border bg-amber-500/15 text-amber-300 border-amber-500/30 flex items-center gap-1 font-bold">
              <Award size={11} />
              <span>
                +
                {PersianNumberFormatter.toPersianDigits(
                  effect.militaryTechDelta,
                )}{" "}
                فناوری نظامی
              </span>
            </span>
          )}

        {effect.industrialLevelDelta !== undefined &&
          effect.industrialLevelDelta !== 0 && (
            <span className="px-2 py-0.5 rounded-lg border bg-emerald-500/15 text-emerald-300 border-emerald-500/30 flex items-center gap-1 font-bold">
              <Cpu size={11} />
              <span>
                +
                {PersianNumberFormatter.toPersianDigits(
                  effect.industrialLevelDelta,
                )}{" "}
                فناوری صنعت
              </span>
            </span>
          )}

        {effect.infantryDelta !== undefined && effect.infantryDelta !== 0 && (
          <span
            className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 font-bold ${
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
              پیاده
            </span>
          </span>
        )}

        {effect.armorDelta !== undefined && effect.armorDelta !== 0 && (
          <span
            className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 font-bold ${
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
              className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 font-bold ${
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

        {effect.droneMissileDelta !== undefined &&
          effect.droneMissileDelta !== 0 && (
            <span
              className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 font-bold ${
                effect.droneMissileDelta > 0
                  ? "bg-treasury/15 text-treasury border-treasury/30"
                  : "bg-rose-500/15 text-rose-400 border-rose-500/30"
              }`}
            >
              <Radio size={11} />
              <span>
                {effect.droneMissileDelta > 0 ? "+" : ""}
                {PersianNumberFormatter.formatNumberWithCommas(
                  effect.droneMissileDelta,
                )}{" "}
                موشک
              </span>
            </span>
          )}
      </div>
    </button>
  );
}
