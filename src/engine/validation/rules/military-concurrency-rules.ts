import type { GameAction } from "@/domain/game/action.schema";

export class MilitaryConcurrencyRules {
  public verify(_actionList: GameAction[], _newAction: GameAction): void {}
}
