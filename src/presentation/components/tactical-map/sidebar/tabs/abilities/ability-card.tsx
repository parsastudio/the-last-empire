import React from "react";
import {
  Zap,
  ShieldAlert,
  Landmark,
  Flame,
  Globe2,
  LucideIcon,
} from "lucide-react";
import { getGovernmentTypeLabel } from "@/domain/politics/government-label.utility";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";

export interface AbilityItem {
  id: string;
  name: string;
  requiredGov: string;
  govLabel: string;
  desc: string;
  cooldown: string;
  icon: LucideIcon;
  color: string;
}

export const REGIME_ABILITIES: AbilityItem[] = [
  {
    id: "DIPLOMATIC_SUMMIT",
    name: "نشست دیپلماتیک",
    requiredGov: "DEMOCRACY",
    govLabel: getGovernmentTypeLabel("DEMOCRACY"),
    desc: "افزایش فوری ۲۰+ امتیاز نظر با یک کشور هدف و بهبود اعتبار جهانی.",
    cooldown: "۱۲ نوبت خنک‌سازی",
    icon: Globe2,
    color: "text-diplomacy",
  },
  {
    id: "MARTIAL_LAW",
    name: "اعلام حکومت نظامی",
    requiredGov: "DICTATORSHIP",
    govLabel: getGovernmentTypeLabel("DICTATORSHIP"),
    desc: "سرکوب ناآرامی‌ها و افزایش فوری ۱۵+ درصد ثبات داخلی کشور.",
    cooldown: "۲۰ نوبت خنک‌سازی",
    icon: ShieldAlert,
    color: "text-military",
  },
  {
    id: "INDUSTRIAL_MOBILIZATION",
    name: "بسیج صنعتی",
    requiredGov: "COMMUNISM",
    govLabel: getGovernmentTypeLabel("COMMUNISM"),
    desc: "افزایش ۵+ درصدی ضریب رشد اقتصاد به مدت ۵ نوبت با قربانی کردن بخشی از نیروی انسانی.",
    cooldown: "۲۵ نوبت خنک‌سازی",
    icon: Zap,
    color: "text-gdp",
  },
  {
    id: "WAR_ALERT",
    name: "هشدار امنیتی ارتش",
    requiredGov: "FASCISM",
    govLabel: getGovernmentTypeLabel("FASCISM"),
    desc: "کاهش فوری ۳۰ واحدی فرسایش ساختاری ارتش و نیروها.",
    cooldown: "۲۰ نوبت خنک‌سازی",
    icon: Flame,
    color: "text-treasury",
  },
  {
    id: "ROYAL_DECREE",
    name: "فرمان سلطنتی",
    requiredGov: "MONARCHY",
    govLabel: getGovernmentTypeLabel("MONARCHY"),
    desc: "هزینه ۴۰,۰۰۰ از خزانه برای جهش فوری ۱۵ واحدی اعتبار جهانی کشور.",
    cooldown: "۲۰ نوبت خنک‌سازی",
    icon: Landmark,
    color: "text-amber-500",
  },
];

interface AbilityCardProps {
  ability: AbilityItem;
  currentGovernment: string;
  nationId: string;
  onActivate: (ability: AbilityItem) => void;
}

export function AbilityCard({
  ability,
  currentGovernment,
  nationId,
  onActivate,
}: AbilityCardProps) {
  const Icon = ability.icon;
  const isCompatible = ability.requiredGov === currentGovernment;
  const { dispatchAction } = useGameActions();

  const handleActivateClick = async () => {
    if (!isCompatible) {
      return;
    }

    if (ability.id === "DIPLOMATIC_SUMMIT") {
      onActivate(ability);
      return;
    }

    type AbilityEnum =
      | "DIPLOMATIC_SUMMIT"
      | "MARTIAL_LAW"
      | "INDUSTRIAL_MOBILIZATION"
      | "ROYAL_DECREE"
      | "WAR_ALERT";

    const action = ActionFactory.activateAbility(
      nationId,
      ability.id as AbilityEnum,
    );

    await dispatchAction(
      action,
      `توانمندی ${ability.name} با موفقیت فعال گردید.`,
    );
  };

  return (
    <div
      className={`p-4 rounded-2xl border transition-all space-y-3 text-right dir-rtl ${
        isCompatible
          ? "bg-background/60 border-primary/40 shadow-sm"
          : "bg-background/20 border-border/40 opacity-60"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} className={ability.color} />
          <span className="text-xs font-bold text-foreground">
            {ability.name}
          </span>
        </div>
        <span
          className={`text-[9px] font-mono px-2 py-0.5 rounded-md ${
            isCompatible
              ? "bg-gdp/20 text-gdp font-bold"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          مختص: {ability.govLabel}
        </span>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {ability.desc}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <span className="text-[9px] font-mono text-muted-foreground">
          {ability.cooldown}
        </span>
        <button
          onClick={handleActivateClick}
          disabled={!isCompatible}
          className={`py-2 px-4 rounded-xl text-[10px] font-bold transition-all shadow-sm ${
            isCompatible
              ? "bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
          }`}
        >
          {isCompatible ? "فعال‌سازی توانمندی" : "نیازمند تغییر رژیم"}
        </button>
      </div>
    </div>
  );
}
