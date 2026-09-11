import { DilemmaEvent } from "@/domain/events/dilemma.schema";

export const DOMESTIC_DILEMMA_EVENTS: readonly DilemmaEvent[] = Object.freeze([
  {
    id: "industrial_labor_union_unrest",
    category: "DOMESTIC",
    urgency: "HIGH",
    choices: [
      {
        id: "approve_wage_subsidies",
        effect: {
          treasuryGdpPercent: -0.02,
          stabilityDelta: 12,
        },
      },
      {
        id: "enforce_labor_laws",
        effect: {
          stabilityDelta: -14,
          globalReputationDelta: -5,
        },
      },
    ],
  },
  {
    id: "bureaucratic_purge_demand",
    category: "DOMESTIC",
    urgency: "MEDIUM",
    choices: [
      {
        id: "root_out_corruption",
        effect: {
          treasuryGdpPercent: 0.015,
          stabilityDelta: 14,
          globalReputationDelta: 6,
        },
      },
      {
        id: "silent_administrative_reform",
        effect: {
          stabilityDelta: -8,
        },
      },
    ],
  },
  {
    id: "natural_disaster_rebuilding",
    category: "DOMESTIC",
    urgency: "CRITICAL",
    choices: [
      {
        id: "fund_reconstruction",
        effect: {
          treasuryGdpPercent: -0.025,
          stabilityDelta: 10,
          globalReputationDelta: 4,
        },
      },
      {
        id: "lean_relief",
        effect: {
          stabilityDelta: -16,
        },
      },
    ],
  },
  {
    id: "university_student_movements",
    category: "DOMESTIC",
    urgency: "MEDIUM",
    choices: [
      {
        id: "grant_campus_autonomy",
        effect: {
          treasuryGdpPercent: -0.01,
          industrialLevelDelta: 0.1,
          stabilityDelta: 8,
        },
      },
      {
        id: "disperse_movements",
        effect: {
          stabilityDelta: -9,
          globalReputationDelta: -4,
        },
      },
    ],
  },
  {
    id: "national_anthem_and_emblem_revamp",
    category: "DOMESTIC",
    urgency: "LOW",
    choices: [
      {
        id: "fund_cultural_gala",
        effect: {
          treasuryGdpPercent: -0.008,
          stabilityDelta: 9,
          globalReputationDelta: 3,
        },
      },
      {
        id: "austerity_culture",
        effect: {
          stabilityDelta: 0,
        },
      },
    ],
  },
  {
    id: "provincial_autonomy_referendum_push",
    category: "DOMESTIC",
    urgency: "HIGH",
    choices: [
      {
        id: "decentralize_funds",
        effect: {
          treasuryGdpPercent: -0.015,
          stabilityDelta: 11,
        },
      },
      {
        id: "centralize_treasury",
        effect: {
          stabilityDelta: -12,
        },
      },
    ],
  },
]);
