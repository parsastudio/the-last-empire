import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import { CoalitionManager } from "@/modules/diplomacy/domain/coalition-manager";
import { TurnPhase, PipelineContext } from "./turn-phase";

export class DiplomacyPhase implements TurnPhase {
  private coalitionManager = new CoalitionManager();

  public execute(context: PipelineContext): GameState {
    return this.coalitionManager.processCoalitions(context.state);
  }
}
