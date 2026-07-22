import type { GameState } from "@/core/types/game-state.types";
import type { GameEvent } from "@/core/types/events.types";
import { EventRegistry } from "./event-registry";
import { EventLogger } from "@/modules/game-engine/domain/event-logger";

export class EventEvaluator {
  private registry = new EventRegistry();
  private logger = new EventLogger();

  public evaluateTurnEvents(state: GameState): GameState {
    const events = this.registry.getAllEvents();

    for (const [id, nation] of Object.entries(state.nations)) {
      if (!nation.isAlive) {
        continue;
      }

      const activeWar = Object.values(nation.relations).some(
        (r) => r.stance === "WAR",
      );

      for (const event of events) {
        if (
          this.isTriggered(
            event,
            nation.government.stability,
            nation.treasury,
            activeWar,
            id,
            state.eventFlags,
          )
        ) {
          if (nation.isAi) {
            const randomChoice =
              event.choices[Math.floor(Math.random() * event.choices.length)];
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
    isAtWar: boolean,
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
    if (cond.isAtWar !== undefined && isAtWar !== cond.isAtWar) {
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
