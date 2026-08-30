import {
  Shield,
  ShieldAlert,
  Crosshair,
  Plane,
  Radio,
  LucideIcon,
} from "lucide-react";
import { UnitType } from "@geopolitics/domain";

export interface MilitaryUnitVisualConfig {
  type: UnitType;
  nameFa: string;
  unitLabelFa: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}

export const MILITARY_UNIT_VISUALS: Record<UnitType, MilitaryUnitVisualConfig> =
  {
    INFANTRY: {
      type: "INFANTRY",
      nameFa: "پیاده‌نظام رزمی",
      unitLabelFa: "یگان",
      icon: Shield,
      colorClass: "text-primary",
      bgClass: "bg-primary/10 border-primary/20",
    },
    ARMOR: {
      type: "ARMOR",
      nameFa: "لشکر زرهی و تانک‌ها",
      unitLabelFa: "یگان",
      icon: ShieldAlert,
      colorClass: "text-military",
      bgClass: "bg-military/10 border-military/20",
    },
    AIR_DEFENSE: {
      type: "AIR_DEFENSE",
      nameFa: "پدافند هوایی موشکی",
      unitLabelFa: "واحد",
      icon: Crosshair,
      colorClass: "text-diplomacy",
      bgClass: "bg-diplomacy/10 border-diplomacy/20",
    },
    AIR_FORCE: {
      type: "AIR_FORCE",
      nameFa: "اسکادران جنگنده‌ها",
      unitLabelFa: "فروند",
      icon: Plane,
      colorClass: "text-gdp",
      bgClass: "bg-gdp/10 border-gdp/20",
    },
    DRONE_MISSILE: {
      type: "DRONE_MISSILE",
      nameFa: "پهپاد و موشک‌های نقطه‌زن",
      unitLabelFa: "یگان",
      icon: Radio,
      colorClass: "text-treasury",
      bgClass: "bg-treasury/10 border-treasury/20",
    },
  };
