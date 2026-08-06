import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";

export class ActionQueue {
  private queue: GameAction[] = [];

  public enqueue(state: GameState, action: GameAction): void {
    this.verifyConcurrency(action);
    this.queue.push(action);
  }

  private verifyConcurrency(newAction: GameAction): void {
    const canonicalNewNationId = CountryRegistry.resolveCanonicalId(
      newAction.nationId,
    );

    if (newAction.type === "REQUEST_LOAN") {
      if (
        this.queue.some((a) => {
          const aId = CountryRegistry.resolveCanonicalId(a.nationId);
          return (
            a.type === "REQUEST_LOAN" &&
            (a.nationId === newAction.nationId || aId === canonicalNewNationId)
          );
        })
      ) {
        throw new GameError(
          "INVALID_ACTION",
          "امکان دریافت چند وام در یک نوبت وجود ندارد.",
        );
      }
    }

    if (newAction.type === "TRADE_RESOURCES") {
      const hasConflict = this.queue.some((a) => {
        const aId = CountryRegistry.resolveCanonicalId(a.nationId);
        return (
          a.type === "TRADE_RESOURCES" &&
          (a.nationId === newAction.nationId || aId === canonicalNewNationId) &&
          a.resourceType === newAction.resourceType
        );
      });
      if (hasConflict) {
        throw new GameError(
          "INVALID_ACTION",
          "معامله این منبع قبلاً در این نوبت ثبت شده است.",
        );
      }
    }
  }

  public getQueue(): readonly GameAction[] {
    return Object.freeze([...this.queue]);
  }

  public clear(): void {
    this.queue = [];
  }

  public size(): number {
    return this.queue.length;
  }
}
