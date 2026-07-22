import type { GameEvent } from "@/core/types/events.types";

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
    this.register({
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
    });

    this.register({
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
    });
  }
}
