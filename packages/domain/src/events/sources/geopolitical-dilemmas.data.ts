import { DilemmaEvent } from "@/domain/events/dilemma.schema";

export const GEOPOLITICAL_DILEMMA_EVENTS: readonly DilemmaEvent[] =
  Object.freeze([
    {
      id: "superpower_ultimatum",
      category: "GEOPOLITICAL",
      urgency: "CRITICAL",
      choices: [
        {
          id: "pay_diplomatic_settlement",
          effect: {
            treasuryGdpPercent: -0.03,
            globalReputationDelta: 6,
            stabilityDelta: -4,
          },
        },
        {
          id: "defy_superpower",
          effect: {
            stabilityDelta: 10,
            globalReputationDelta: -16,
          },
        },
      ],
    },
    {
      id: "international_peace_accord",
      category: "GEOPOLITICAL",
      urgency: "HIGH",
      choices: [
        {
          id: "host_summit",
          effect: {
            treasuryGdpPercent: -0.015,
            globalReputationDelta: 16,
            stabilityDelta: 4,
          },
        },
        {
          id: "stay_neutral",
          effect: {
            globalReputationDelta: -4,
          },
        },
      ],
    },
    {
      id: "refugee_corridor_crisis",
      category: "GEOPOLITICAL",
      urgency: "HIGH",
      choices: [
        {
          id: "open_humanitarian_camps",
          effect: {
            treasuryGdpPercent: -0.015,
            globalReputationDelta: 14,
            stabilityDelta: -3,
          },
        },
        {
          id: "seal_borders",
          effect: {
            stabilityDelta: 5,
            globalReputationDelta: -12,
          },
        },
      ],
    },
    {
      id: "allied_loan_guarantee_request",
      category: "GEOPOLITICAL",
      urgency: "MEDIUM",
      choices: [
        {
          id: "back_ally_loan",
          effect: {
            treasuryGdpPercent: -0.02,
            globalReputationDelta: 10,
            stabilityDelta: 3,
          },
        },
        {
          id: "refuse_guarantee",
          effect: {
            globalReputationDelta: -8,
          },
        },
      ],
    },
    {
      id: "international_strait_claims",
      category: "GEOPOLITICAL",
      urgency: "HIGH",
      choices: [
        {
          id: "show_of_force",
          effect: {
            treasuryGdpPercent: -0.01,
            stabilityDelta: 7,
            globalReputationDelta: -4,
          },
        },
        {
          id: "arbitration_court",
          effect: {
            globalReputationDelta: 10,
            stabilityDelta: -4,
          },
        },
      ],
    },
    {
      id: "foreign_investment_wave",
      category: "GEOPOLITICAL",
      urgency: "MEDIUM",
      choices: [
        {
          id: "accept_investment",
          effect: {
            treasuryGdpPercent: 0.03,
            globalReputationDelta: 8,
            stabilityDelta: -2,
          },
        },
        {
          id: "reject_for_sovereignty",
          effect: {
            stabilityDelta: 6,
          },
        },
      ],
    },
  ]);
