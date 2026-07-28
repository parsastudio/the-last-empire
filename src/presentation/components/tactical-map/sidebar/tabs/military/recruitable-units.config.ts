import React from "react";
import { Shield, Plane, Radio } from "lucide-react";

export interface UnitConfig {
  type: string;
  name: string;
  moneyCost: number;
  manpowerCost: number;
  steelCost: number;
  buildTurns: number;
  icon: React.ComponentType<{ size: number; className?: string }>;
  color: string;
}

export const RECRUITABLE_UNITS: UnitConfig[] = [
  {
    type: "INFANTRY",
    name: "پیاده‌نظام رزمی (۱۰ هزار نفر)",
    moneyCost: 100,
    manpowerCost: 10,
    steelCost: 0,
    buildTurns: 2,
    icon: Shield,
    color: "text-primary",
  },
  {
    type: "AIR_FORCE",
    name: "نیروی هوایی (۱۰ فروند جنگنده)",
    moneyCost: 500,
    manpowerCost: 5,
    steelCost: 20,
    buildTurns: 4,
    icon: Plane,
    color: "text-gdp",
  },
  {
    type: "DRONE_MISSILE",
    name: "یگان موشکی و پهپادی (۱۰ یگان)",
    moneyCost: 1200,
    manpowerCost: 1,
    steelCost: 25,
    buildTurns: 1,
    icon: Radio,
    color: "text-treasury",
  },
];
