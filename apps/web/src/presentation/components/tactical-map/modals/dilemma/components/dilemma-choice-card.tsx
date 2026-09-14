import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
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
  LucideIcon,
} from "lucide-react";
import { DilemmaChoice } from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface DilemmaChoiceCardProps {
  eventId: string;
  choice: DilemmaChoice;
  choiceIndex: number;
  isSelected: boolean;
  nationGdp: number;
  onSelect: (choiceId: string) => void;
}

interface RenderedEffectBadge {
  id: string;
  icon: LucideIcon;
  text: string;
  isPositive: boolean;
  styleClass: string;
}

export function DilemmaChoiceCard({
  eventId,
  choice,
  choiceIndex,
  isSelected,
  nationGdp,
  onSelect,
}: DilemmaChoiceCardProps) {
  const t = useTranslations("dilemmas");
  const { formatCurrency, formatPercent, formatNumber, toDigits } =
    useLocaleFormatter();
  const effect = choice.effect;

  const choiceLabel = t(`events.${eventId}.choices.${choice.id}.label`);
  const choiceDescription = t(
    `events.${eventId}.choices.${choice.id}.description`,
  );

  let moneyVal = effect.treasuryDelta || 0;
  if (
    effect.treasuryGdpPercent !== undefined &&
    effect.treasuryGdpPercent !== 0
  ) {
    moneyVal = Math.floor(nationGdp * effect.treasuryGdpPercent);
  }

  const badges = useMemo<RenderedEffectBadge[]>(() => {
    const list: RenderedEffectBadge[] = [];

    if (moneyVal !== 0) {
      list.push({
        id: "money",
        icon: Coins,
        text: `${moneyVal > 0 ? "+" : ""}${formatCurrency(moneyVal, true)}`,
        isPositive: moneyVal > 0,
        styleClass:
          moneyVal > 0
            ? "bg-gdp/15 text-gdp border-gdp/30"
            : "bg-rose-500/15 text-rose-400 border-rose-500/30",
      });
    }

    if (effect.stabilityDelta) {
      list.push({
        id: "stability",
        icon: Landmark,
        text: `${effect.stabilityDelta > 0 ? "+" : ""}${formatPercent(effect.stabilityDelta)} ${t("modal.units.stability")}`,
        isPositive: effect.stabilityDelta > 0,
        styleClass:
          effect.stabilityDelta > 0
            ? "bg-gdp/15 text-gdp border-gdp/30"
            : "bg-rose-500/15 text-rose-400 border-rose-500/30",
      });
    }

    if (effect.globalReputationDelta) {
      list.push({
        id: "reputation",
        icon: Globe,
        text: `${effect.globalReputationDelta > 0 ? "+" : ""}${toDigits(effect.globalReputationDelta)} ${t("modal.units.prestige")}`,
        isPositive: effect.globalReputationDelta > 0,
        styleClass:
          effect.globalReputationDelta > 0
            ? "bg-gdp/15 text-gdp border-gdp/30"
            : "bg-rose-500/15 text-rose-400 border-rose-500/30",
      });
    }

    if (effect.militaryTechDelta) {
      list.push({
        id: "milTech",
        icon: Award,
        text: `+${toDigits(effect.militaryTechDelta)} ${t("modal.units.milTech")}`,
        isPositive: true,
        styleClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      });
    }

    if (effect.industrialLevelDelta) {
      list.push({
        id: "indTech",
        icon: Cpu,
        text: `+${toDigits(effect.industrialLevelDelta)} ${t("modal.units.indTech")}`,
        isPositive: true,
        styleClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      });
    }

    const unitBadges = [
      {
        delta: effect.infantryDelta,
        unit: "infantry",
        icon: Shield,
        colorClass: "bg-primary/15 text-primary border-primary/30",
      },
      {
        delta: effect.armorDelta,
        unit: "armor",
        icon: ShieldAlert,
        colorClass: "bg-military/15 text-military border-military/30",
      },
      {
        delta: effect.airDefenseDelta,
        unit: "airDefense",
        icon: Crosshair,
        colorClass: "bg-diplomacy/15 text-diplomacy border-diplomacy/30",
      },
      {
        delta: effect.droneMissileDelta,
        unit: "droneMissile",
        icon: Radio,
        colorClass: "bg-treasury/15 text-treasury border-treasury/30",
      },
    ];

    for (let i = 0; i < unitBadges.length; i++) {
      const b = unitBadges[i]!;
      if (b.delta) {
        list.push({
          id: b.unit,
          icon: b.icon,
          text: `${b.delta > 0 ? "+" : ""}${formatNumber(b.delta)} ${t(`modal.units.${b.unit}`)}`,
          isPositive: b.delta > 0,
          styleClass:
            b.delta > 0
              ? b.colorClass
              : "bg-rose-500/15 text-rose-400 border-rose-500/30",
        });
      }
    }

    return list;
  }, [
    moneyVal,
    effect,
    formatCurrency,
    formatPercent,
    formatNumber,
    toDigits,
    t,
  ]);

  return (
    <button
      type="button"
      onClick={() => onSelect(choice.id)}
      className={`w-full p-4 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-3 font-sans text-start cursor-pointer group backdrop-blur-xl ${
        isSelected
          ? "bg-primary/20 border-primary shadow-xl shadow-primary/20 ring-2 ring-primary/40 scale-[1.01]"
          : "bg-card/90 border-border/80 hover:border-primary/50 hover:bg-secondary/40 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="space-y-1.5 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-xl bg-secondary/80 border border-border/70 flex items-center justify-center text-xs font-mono font-black text-muted-foreground group-hover:text-primary transition-colors shrink-0">
              {toDigits(choiceIndex + 1)}
            </span>
            <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
              {choiceLabel}
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

        <p className="text-xs text-muted-foreground leading-relaxed font-sans ps-8">
          {choiceDescription}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 ps-8 font-mono text-[10px] w-full pt-1 border-t border-border/40">
        {badges.map((badge) => {
          const BadgeIcon = badge.icon;
          return (
            <span
              key={badge.id}
              className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 font-bold ${badge.styleClass}`}
            >
              <BadgeIcon size={11} />
              <span>{badge.text}</span>
            </span>
          );
        })}
      </div>
    </button>
  );
}
