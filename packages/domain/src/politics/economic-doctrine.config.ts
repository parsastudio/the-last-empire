import {
  EconomicDoctrineStance,
  EconomicDoctrineConfig,
} from "./economic-doctrine.schema";

export type { EconomicDoctrineStance, EconomicDoctrineConfig };

export const ECONOMIC_DOCTRINE_CONFIGS: Record<
  EconomicDoctrineStance,
  EconomicDoctrineConfig
> = {
  AUTARKY: {
    stance: "AUTARKY",
    domesticWeight: 1.0,
    globalWeight: 0.0,
  },
  PROTECTIONISM: {
    stance: "PROTECTIONISM",
    domesticWeight: 0.75,
    globalWeight: 0.25,
  },
  BALANCED_MIXED: {
    stance: "BALANCED_MIXED",
    domesticWeight: 0.5,
    globalWeight: 0.5,
  },
  FREE_TRADE: {
    stance: "FREE_TRADE",
    domesticWeight: 0.25,
    globalWeight: 0.75,
  },
  MERCANTILE_HUB: {
    stance: "MERCANTILE_HUB",
    domesticWeight: 0.0,
    globalWeight: 1.0,
  },
};

export const ALL_ECONOMIC_DOCTRINES: EconomicDoctrineStance[] = [
  "AUTARKY",
  "PROTECTIONISM",
  "BALANCED_MIXED",
  "FREE_TRADE",
  "MERCANTILE_HUB",
];
