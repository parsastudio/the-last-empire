import { DilemmaEvent } from "@/domain/events/dilemma.schema";

export const MILITARY_DILEMMA_EVENTS: readonly DilemmaEvent[] = Object.freeze([
  {
    id: "covert_arms_offer",
    category: "MILITARY",
    urgency: "MEDIUM",
    choices: [
      {
        id: "sell_tanks_batch",
        effect: {
          treasuryGdpPercent: 0.035,
          armorDelta: -8,
        },
      },
      {
        id: "keep_readiness",
        effect: {
          stabilityDelta: 3,
        },
      },
    ],
  },
  {
    id: "strait_security_incident",
    category: "MILITARY",
    urgency: "CRITICAL",
    choices: [
      {
        id: "dispatch_naval_taskforce",
        effect: {
          treasuryGdpPercent: -0.015,
          globalReputationDelta: 10,
          stabilityDelta: 4,
        },
      },
      {
        id: "pass_incident",
        effect: {
          globalReputationDelta: -12,
          stabilityDelta: -5,
        },
      },
    ],
  },
  {
    id: "national_conscription_surge",
    category: "MILITARY",
    urgency: "MEDIUM",
    choices: [
      {
        id: "expand_divisions",
        effect: {
          treasuryGdpPercent: -0.02,
          infantryDelta: 35,
          stabilityDelta: 6,
        },
      },
      {
        id: "selective_intake",
        effect: {
          infantryDelta: 10,
          stabilityDelta: 2,
        },
      },
    ],
  },
  {
    id: "ammunition_plant_modernization",
    category: "MILITARY",
    urgency: "HIGH",
    choices: [
      {
        id: "fund_missile_expansion",
        effect: {
          treasuryGdpPercent: -0.025,
          droneMissileDelta: 25,
        },
      },
      {
        id: "maintain_current_pace",
        effect: {
          stabilityDelta: 0,
        },
      },
    ],
  },
  {
    id: "veterans_welfare_bill",
    category: "MILITARY",
    urgency: "LOW",
    choices: [
      {
        id: "approve_pension",
        effect: {
          treasuryGdpPercent: -0.01,
          stabilityDelta: 8,
        },
      },
      {
        id: "defer_welfare",
        effect: {
          stabilityDelta: -6,
        },
      },
    ],
  },
  {
    id: "air_defense_readiness_drill",
    category: "MILITARY",
    urgency: "MEDIUM",
    choices: [
      {
        id: "conduct_drill",
        effect: {
          treasuryGdpPercent: -0.015,
          airDefenseDelta: 8,
          stabilityDelta: 3,
        },
      },
      {
        id: "simulator_only",
        effect: {
          stabilityDelta: 0,
        },
      },
    ],
  },
]);
