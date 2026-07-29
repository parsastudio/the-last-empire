import { GameState } from "@/domain/game/game-state.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { CombatEventLogger } from "@/engine/combat/orchestrator/combat-event-logger";
import { AttackConquestResultProcessor } from "@/engine/combat/actions/attack-conquest-result-processor";

export interface ConquestLogData {
  conquered: GridCell[];
  capitulated: GridCell[];
  attackerLost: number;
  defenderLost: number;
  attackerRetreated: number;
  defenderRetreated: number;
  isVictory: boolean;
}

export class ConquestLogWriter {
  private logger = new CombatEventLogger();
  private processor = new AttackConquestResultProcessor();

  public appendConquestLogs(
    state: GameState,
    attackerId: string,
    defenderId: string,
    data: ConquestLogData,
  ): GameState {
    const message = this.processor.formatConquestSummary(
      attackerId,
      defenderId,
      data.conquered,
      data.capitulated,
    );

    const totalPixels = data.conquered.length + data.capitulated.length;
    const conqueredAreaSqKm = Math.round(totalPixels * 86.3);

    const metadata: Record<string, string | number | boolean> = {
      attackerLost: data.attackerLost,
      defenderLost: data.defenderLost,
      attackerRetreated: data.attackerRetreated,
      defenderRetreated: data.defenderRetreated,
      conqueredAreaSqKm,
      isVictory: data.isVictory,
    };

    const entry = this.logger.createLogEntry(
      state.currentTurn,
      attackerId,
      defenderId,
      message,
    );

    entry.metadata = metadata;

    return {
      ...state,
      turnLogs: [...state.turnLogs, entry],
    };
  }
}
