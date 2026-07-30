import type { GameState } from "@/domain/game/game-state.schema";
import type { GameEvent } from "@/domain/game/events.schema";
import { EventRegistry } from "@/engine/politics/event-registry";
import { EventLogger } from "@/engine/event-logger";

export class EventEvaluator {
  private registry = new EventRegistry();
  private logger = new EventLogger();

  public evaluateTurnEvents(state: GameState): GameState {
    const events = this.registry.getAllEvents();

    for (const [id, nation] of Object.entries(state.nations)) {
      if (!nation.isAlive) {
        continue;
      }

      for (const event of events) {
        let triggerChanceMultiplier = 1.0;
        if (nation.geography.territorySize > 1500) {
          triggerChanceMultiplier = 1.3;
        }

        const seedFactor = Math.sin(state.seed + id.charCodeAt(0)) * 10000;
        const randomChance =
          (seedFactor - Math.floor(seedFactor)) * triggerChanceMultiplier;

        if (
          randomChance > 0.4 &&
          this.isTriggered(
            event,
            nation.government.stability,
            nation.treasury,
            id,
            state.eventFlags,
          )
        ) {
          if (nation.isAi) {
            const randomChoice =
              event.choices[Math.floor(randomChance * event.choices.length)];
            if (randomChoice) {
              const entry = this.logger.createEntry(
                state.currentTurn,
                id,
                "INFO",
                `AI chosen event resolution: ${randomChoice.description}`,
              );
              state.turnLogs.push(entry);
            }
          } else {
            const entry = this.logger.createEntry(
              state.currentTurn,
              id,
              "WARNING",
              `Event triggered: ${event.title}. Choice required.`,
            );
            state.turnLogs.push(entry);
          }
        }
      }
    }

    return state;
  }

  private isTriggered(
    event: GameEvent,
    stability: number,
    treasury: number,
    nationId: string,
    eventFlags: Record<string, boolean>,
  ): boolean {
    const cond = event.triggerCondition;

    if (cond.minStability !== undefined && stability < cond.minStability) {
      return false;
    }
    if (cond.maxStability !== undefined && stability > cond.maxStability) {
      return false;
    }
    if (cond.minTreasury !== undefined && treasury < cond.minTreasury) {
      return false;
    }
    if (cond.maxTreasury !== undefined && treasury > cond.maxTreasury) {
      return false;
    }
    if (
      cond.specificNationId !== undefined &&
      cond.specificNationId !== nationId
    ) {
      return false;
    }

    if (cond.requiredFlags) {
      for (const [flag, expected] of Object.entries(cond.requiredFlags)) {
        const actual = !!eventFlags[flag];
        if (actual !== expected) {
          return false;
        }
      }
    }

    return true;
  }
}
