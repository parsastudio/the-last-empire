import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import { CoalitionManager } from "@/modules/diplomacy/domain/coalition-manager";
import { TurnPhase } from "./turn-phase";

export class DiplomacyPhase implements TurnPhase {
  private coalitionManager = new CoalitionManager();

  public execute(state: GameState): GameState {
    return this.coalitionManager.processCoalitions(state);
  }
}
