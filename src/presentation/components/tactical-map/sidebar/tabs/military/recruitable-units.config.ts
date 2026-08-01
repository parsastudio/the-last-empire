import React from "react";
import { Shield, Plane, Radio } from "lucide-react";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";

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
    type: MILITARY_UNIT_STATS.INFANTRY.type,
    name: MILITARY_UNIT_STATS.INFANTRY.nameFa,
    moneyCost: MILITARY_UNIT_STATS.INFANTRY.moneyCost,
    manpowerCost: MILITARY_UNIT_STATS.INFANTRY.manpowerCost,
    steelCost: MILITARY_UNIT_STATS.INFANTRY.steelCost,
    buildTurns: MILITARY_UNIT_STATS.INFANTRY.buildTurns,
    icon: Shield,
    color: "text-primary",
  },
  {
    type: MILITARY_UNIT_STATS.AIR_FORCE.type,
    name: MILITARY_UNIT_STATS.AIR_FORCE.nameFa,
    moneyCost: MILITARY_UNIT_STATS.AIR_FORCE.moneyCost,
    manpowerCost: MILITARY_UNIT_STATS.AIR_FORCE.manpowerCost,
    steelCost: MILITARY_UNIT_STATS.AIR_FORCE.steelCost,
    buildTurns: MILITARY_UNIT_STATS.AIR_FORCE.buildTurns,
    icon: Plane,
    color: "text-gdp",
  },
  {
    type: MILITARY_UNIT_STATS.DRONE_MISSILE.type,
    name: MILITARY_UNIT_STATS.DRONE_MISSILE.nameFa,
    moneyCost: MILITARY_UNIT_STATS.DRONE_MISSILE.moneyCost,
    manpowerCost: MILITARY_UNIT_STATS.DRONE_MISSILE.manpowerCost,
    steelCost: MILITARY_UNIT_STATS.DRONE_MISSILE.steelCost,
    buildTurns: MILITARY_UNIT_STATS.DRONE_MISSILE.buildTurns,
    icon: Radio,
    color: "text-treasury",
  },
];
