import { DilemmaEvent } from "@/domain/events/dilemma.schema";

export const ECONOMIC_DILEMMA_EVENTS: readonly DilemmaEvent[] = Object.freeze([
  {
    id: "energy_reserves_boom",
    category: "ECONOMIC",
    urgency: "HIGH",
    choices: [
      {
        id: "sell_concession",
        effect: {
          treasuryGdpPercent: 0.04,
          globalReputationDelta: -5,
          stabilityDelta: 2,
        },
      },
      {
        id: "strategic_reserve",
        effect: {
          treasuryGdpPercent: -0.02,
          industrialLevelDelta: 0.2,
          stabilityDelta: 6,
        },
      },
    ],
  },
  {
    id: "supply_chain_bottleneck",
    category: "ECONOMIC",
    urgency: "MEDIUM",
    choices: [
      {
        id: "subsidize_freight",
        effect: {
          treasuryGdpPercent: -0.015,
          stabilityDelta: 4,
        },
      },
      {
        id: "ration_materials",
        effect: {
          stabilityDelta: -8,
        },
      },
    ],
  },
  {
    id: "hyperinflation_threat",
    category: "ECONOMIC",
    urgency: "HIGH",
    choices: [
      {
        id: "tighten_monetary",
        effect: {
          treasuryGdpPercent: -0.02,
          stabilityDelta: 10,
        },
      },
      {
        id: "price_controls",
        effect: {
          stabilityDelta: -10,
          globalReputationDelta: -4,
        },
      },
    ],
  },
  {
    id: "debt_relief_opportunity",
    category: "ECONOMIC",
    urgency: "MEDIUM",
    choices: [
      {
        id: "repay_bulk",
        effect: {
          treasuryGdpPercent: -0.03,
          globalReputationDelta: 12,
          stabilityDelta: 4,
        },
      },
      {
        id: "decline_offer",
        effect: {
          stabilityDelta: 0,
        },
      },
    ],
  },
  {
    id: "industrial_patent_auction",
    category: "ECONOMIC",
    urgency: "MEDIUM",
    choices: [
      {
        id: "buy_patents",
        effect: {
          treasuryGdpPercent: -0.025,
          industrialLevelDelta: 0.2,
        },
      },
      {
        id: "ignore_patents",
        effect: {},
      },
    ],
  },
  {
    id: "foreign_trade_embargo_risk",
    category: "ECONOMIC",
    urgency: "HIGH",
    choices: [
      {
        id: "retaliate_tariffs",
        effect: {
          stabilityDelta: 8,
          globalReputationDelta: -8,
        },
      },
      {
        id: "concede_lobby",
        effect: {
          treasuryGdpPercent: -0.015,
          globalReputationDelta: 6,
        },
      },
    ],
  },
]);
