import type { GameEvent } from "@/domain/game/events.schema";

const DEFAULT_EVENTS_DATA: GameEvent[] = [
  {
    id: "economic-crisis",
    title: "Global Economic Crisis",
    description:
      "Economic markets are crashing worldwide. Our financial system is on the brink.",
    triggerCondition: {
      maxStability: 40,
    },
    choices: [
      {
        id: "bailout",
        description:
          "Implement major bank bailouts with direct treasury subsidies.",
        effects: {
          treasuryDelta: -50000,
          stabilityDelta: 15,
        },
      },
      {
        id: "austerity",
        description: "Enforce harsh austerity policies. Save national funds.",
        effects: {
          treasuryDelta: 20000,
          stabilityDelta: -15,
        },
      },
    ],
  },
  {
    id: "military-enthusiasm",
    title: "Military Enthusiasm",
    description:
      "Our population is highly motivated by recent displays of defensive readiness.",
    triggerCondition: {
      minStability: 80,
      isAtWar: false,
    },
    choices: [
      {
        id: "recruit-patriots",
        description: "Initiate special voluntary recruitment campaigns.",
        effects: {
          manpowerDelta: 15000,
          treasuryDelta: -10000,
        },
      },
    ],
  },
  {
    id: "energy-crisis-stage-1",
    title: "Energy Deficit Scarcity",
    description:
      "Severe shortages in raw fuel reserves are limiting electric grids.",
    triggerCondition: {
      minStability: 50,
    },
    choices: [
      {
        id: "ration-energy",
        description: "Ration energy to domestic heavy industries.",
        effects: {
          stabilityDelta: -5,
          treasuryDelta: 10000,
          setFlags: ["energy_crisis_rationed"],
        },
      },
      {
        id: "subsidize-power",
        description:
          "Subsidize power generation plants with massive national capital.",
        effects: {
          stabilityDelta: 5,
          treasuryDelta: -30000,
          setFlags: ["energy_crisis_subsidized"],
        },
      },
    ],
  },
  {
    id: "energy-crisis-strikes",
    title: "Industrial Strikes and Riot Unrest",
    description:
      "Angry workers are striking nationwide over forced industrial energy rationing.",
    triggerCondition: {
      maxStability: 45,
      requiredFlags: {
        energy_crisis_rationed: true,
      },
    },
    choices: [
      {
        id: "deploy-police",
        description:
          "Deploy internal police forces to forcefully crush workers strikes.",
        effects: {
          stabilityDelta: 10,
          reputationDelta: -20,
        },
      },
      {
        id: "lift-rationing",
        description:
          "Negotiate union terms and lift energy rationing restrictions.",
        effects: {
          stabilityDelta: -5,
          treasuryDelta: -15000,
        },
      },
    ],
  },
  {
    id: "energy-crisis-boom",
    title: "Industrial Recovery Success",
    description:
      "Our extensive energy subsidies successfully yielded a massive manufacturing expansion.",
    triggerCondition: {
      requiredFlags: {
        energy_crisis_subsidized: true,
      },
    },
    choices: [
      {
        id: "celebrate-expansion",
        description: "Celebrate nationwide industrial expansion achievements.",
        effects: {
          reputationDelta: 10,
          stabilityDelta: 10,
        },
      },
    ],
  },
];

export class EventRegistry {
  private events: GameEvent[] = [];

  constructor() {
    this.registerDefaultEvents();
  }

  public register(event: GameEvent): void {
    if (!this.events.some((e) => e.id === event.id)) {
      this.events.push(event);
    }
  }

  public getAllEvents(): readonly GameEvent[] {
    return Object.freeze([...this.events]);
  }

  private registerDefaultEvents(): void {
    for (const event of DEFAULT_EVENTS_DATA) {
      this.register(event);
    }
  }
}
