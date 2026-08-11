import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";

export class ActionQueue {
  private queue: GameAction[] = [];
  private loanNations = new Set<string>();
  private tradeKeys = new Set<string>();

  public enqueue(state: GameState, action: GameAction): void {
    this.verifyConcurrency(action);
    this.queue.push(action);
  }

  private verifyConcurrency(newAction: GameAction): void {
    const canonicalNewNationId = CountryRegistry.resolveCanonicalId(
      newAction.nationId,
    );

    if (newAction.type === "REQUEST_LOAN") {
      if (this.loanNations.has(canonicalNewNationId)) {
        throw new GameError(
          "INVALID_ACTION",
          "امکان دریافت چند وام در یک نوبت وجود ندارد.",
        );
      }
      this.loanNations.add(canonicalNewNationId);
    }

    if (newAction.type === "TRADE_RESOURCES") {
      const tradeKey = `${canonicalNewNationId}_${newAction.resourceType}`;
      if (this.tradeKeys.has(tradeKey)) {
        throw new GameError(
          "INVALID_ACTION",
          "معامله این منبع قبلاً در این نوبت ثبت شده است.",
        );
      }
      this.tradeKeys.add(tradeKey);
    }
  }

  public getQueue(): readonly GameAction[] {
    return Object.freeze([...this.queue]);
  }

  public clear(): void {
    this.queue = [];
    this.loanNations.clear();
    this.tradeKeys.clear();
  }
}
