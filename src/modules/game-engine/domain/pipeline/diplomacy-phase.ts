import type { GameState } from "@/core/types";
import { CoalitionManager } from "@/modules/diplomacy/domain/coalition-manager";
import { TurnPhase } from "./turn-phase";

export class DiplomacyPhase implements TurnPhase {
  private coalitionManager = new CoalitionManager();

  public execute(state: GameState): GameState {
    return this.coalitionManager.processCoalitions(state);
  }
}
