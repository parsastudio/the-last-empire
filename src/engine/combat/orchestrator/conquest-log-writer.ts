import { GameState } from "@/domain/game/game-state.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { CombatEventLogger } from "@/engine/combat/orchestrator/combat-event-logger";
import { AttackConquestResultProcessor } from "@/engine/combat/actions/attack-conquest-result-processor";

export class ConquestLogWriter {
  private logger = new CombatEventLogger();
  private processor = new AttackConquestResultProcessor();

  public appendConquestLogs(
    state: GameState,
    attackerId: string,
    defenderId: string,
    conquered: GridCell[],
    capitulated: GridCell[],
  ): GameState {
    const message = this.processor.formatConquestSummary(
      attackerId,
      defenderId,
      conquered,
      capitulated,
    );

    const entry = this.logger.createLogEntry(
      state.currentTurn,
      attackerId,
      defenderId,
      message,
    );

    return {
      ...state,
      turnLogs: [...state.turnLogs, entry],
    };
  }
}
