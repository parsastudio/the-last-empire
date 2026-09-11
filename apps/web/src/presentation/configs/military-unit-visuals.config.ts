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
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}

export const MILITARY_UNIT_VISUALS: Record<UnitType, MilitaryUnitVisualConfig> =
  {
    INFANTRY: {
      type: "INFANTRY",
      icon: Shield,
      colorClass: "text-primary",
      bgClass: "bg-primary/10 border-primary/20",
    },
    ARMOR: {
      type: "ARMOR",
      icon: ShieldAlert,
      colorClass: "text-military",
      bgClass: "bg-military/10 border-military/20",
    },
    AIR_DEFENSE: {
      type: "AIR_DEFENSE",
      icon: Crosshair,
      colorClass: "text-diplomacy",
      bgClass: "bg-diplomacy/10 border-diplomacy/20",
    },
    AIR_FORCE: {
      type: "AIR_FORCE",
      icon: Plane,
      colorClass: "text-gdp",
      bgClass: "bg-gdp/10 border-gdp/20",
    },
    DRONE_MISSILE: {
      type: "DRONE_MISSILE",
      icon: Radio,
      colorClass: "text-treasury",
      bgClass: "bg-treasury/10 border-treasury/20",
    },
  };
