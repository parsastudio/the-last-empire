import {
  GameState,
  TurnLogEntry,
  TurnLogLevel,
} from "@/domain/game/game-state.schema";
import { GameEvent } from "@/domain/game/events.schema";
import { DEFAULT_EVENTS_DATA } from "./event-list.config";

export class EventSystem {
  private events: GameEvent[] = DEFAULT_EVENTS_DATA;

  public static createLogEntry(
    turn: number,
    sourceNationId: string,
    level: TurnLogLevel,
    message: string,
  ): TurnLogEntry {
    const cleanNation = sourceNationId.replace("NATION_", "");
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    return {
      id: `log-${cleanNation}-t${turn}-${randomSuffix}`,
      turn,
      timestamp: Date.now(),
      sourceNationId,
      level,
      message,
    };
  }

  public evaluateTurnEvents(state: GameState): GameState {
    const newLogs = [...state.turnLogs];

    for (const [id, nation] of Object.entries(state.nations)) {
      if (!nation.isAlive) continue;

      for (const event of this.events) {
        if (
          this.isTriggered(
            event,
            nation.government.stability,
            nation.treasury,
            id,
            state.eventFlags,
          )
        ) {
          const log = EventSystem.createLogEntry(
            state.currentTurn,
            id,
            "WARNING",
            `Event triggered: ${event.title}`,
          );
          newLogs.push(log);
        }
      }
    }

    return {
      ...state,
      turnLogs: newLogs,
    };
  }

  private isTriggered(
    event: GameEvent,
    stability: number,
    treasury: number,
    nationId: string,
    eventFlags: Record<string, boolean>,
  ): boolean {
    const cond = event.triggerCondition;
    if (cond.minStability !== undefined && stability < cond.minStability)
      return false;
    if (cond.maxStability !== undefined && stability > cond.maxStability)
      return false;
    if (cond.minTreasury !== undefined && treasury < cond.minTreasury)
      return false;
    if (cond.maxTreasury !== undefined && treasury > cond.maxTreasury)
      return false;
    if (
      cond.specificNationId !== undefined &&
      cond.specificNationId !== nationId
    )
      return false;

    if (cond.requiredFlags) {
      for (const [flag, expected] of Object.entries(cond.requiredFlags)) {
        if (!!eventFlags[flag] !== expected) return false;
      }
    }
    return true;
  }
}
