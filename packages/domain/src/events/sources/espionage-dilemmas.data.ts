import { DilemmaEvent } from "@/domain/events/dilemma.schema";

export const ESPIONAGE_DILEMMA_EVENTS: readonly DilemmaEvent[] = Object.freeze([
  {
    id: "defector_scientist_asylum",
    category: "ESPIONAGE",
    urgency: "HIGH",
    choices: [
      {
        id: "grant_full_asylum",
        effect: {
          treasuryGdpPercent: -0.015,
          militaryTechDelta: 0.15,
          globalReputationDelta: -10,
        },
      },
      {
        id: "extradite_secretly",
        effect: {
          treasuryGdpPercent: 0.02,
          globalReputationDelta: 8,
          stabilityDelta: -4,
        },
      },
    ],
  },
  {
    id: "cyber_grid_intrusion",
    category: "ESPIONAGE",
    urgency: "CRITICAL",
    choices: [
      {
        id: "total_system_overhaul",
        effect: {
          treasuryGdpPercent: -0.02,
          industrialLevelDelta: 0.1,
          stabilityDelta: 3,
        },
      },
      {
        id: "quick_patch",
        effect: {
          airDefenseDelta: -4,
          stabilityDelta: -4,
        },
      },
    ],
  },
  {
    id: "mole_in_general_staff",
    category: "ESPIONAGE",
    urgency: "CRITICAL",
    choices: [
      {
        id: "public_military_tribunal",
        effect: {
          stabilityDelta: 8,
          infantryDelta: -5,
          globalReputationDelta: 4,
        },
      },
      {
        id: "double_agent_trap",
        effect: {
          treasuryGdpPercent: -0.01,
          militaryTechDelta: 0.1,
        },
      },
    ],
  },
  {
    id: "foreign_satellite_blackout",
    category: "ESPIONAGE",
    urgency: "MEDIUM",
    choices: [
      {
        id: "deploy_anti_jamming",
        effect: {
          treasuryGdpPercent: -0.015,
          droneMissileDelta: 8,
        },
      },
      {
        id: "switch_inertial_guidance",
        effect: {
          stabilityDelta: -2,
        },
      },
    ],
  },
  {
    id: "dissident_propaganda_campaign",
    category: "ESPIONAGE",
    urgency: "MEDIUM",
    choices: [
      {
        id: "counter_info_center",
        effect: {
          treasuryGdpPercent: -0.01,
          stabilityDelta: 9,
        },
      },
      {
        id: "ignore_rumors",
        effect: {
          stabilityDelta: -7,
        },
      },
    ],
  },
  {
    id: "industrial_espionage_syndicate",
    category: "ESPIONAGE",
    urgency: "HIGH",
    choices: [
      {
        id: "secure_rd_facilities",
        effect: {
          treasuryGdpPercent: -0.015,
          industrialLevelDelta: 0.1,
          stabilityDelta: 3,
        },
      },
      {
        id: "swift_interrogation",
        effect: {
          treasuryGdpPercent: 0.015,
          globalReputationDelta: -2,
        },
      },
    ],
  },
]);
