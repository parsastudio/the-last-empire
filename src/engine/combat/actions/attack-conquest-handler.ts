import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, AttackAction } from "@/domain/game/action.schema";
import { ActionHandler } from "@/engine/actions/action-handler";
import { GridState } from "@/engine/combat/state/grid-state";
import { ConquestOrchestrator } from "@/engine/combat/orchestrator/conquest-orchestrator";
import { GdpPopUpdater } from "@/engine/combat/state/gdp-pop-updater";

export class AttackConquestHandler implements ActionHandler {
  private orchestrator = new ConquestOrchestrator();
  private gdpPopUpdater = new GdpPopUpdater();

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "ATTACK") {
      return state;
    }

    const attackAction = action as AttackAction;
    const attacker = state.nations[action.nationId];
    const defender = state.nations[attackAction.targetNationId];

    if (!attacker || !defender || !defender.isAlive) {
      return state;
    }

    const gridState: GridState =
      (state as { gridState?: GridState }).gridState || new GridState();
    const allCells = gridState.getAllCells();

    const targetPixel = {
      x: Math.floor(attackAction.infantry % 1024),
      y: Math.floor(attackAction.airForce % 512),
    };

    const result = this.orchestrator.executeAttack(
      attacker.id,
      defender.id,
      targetPixel,
      allCells,
    );

    const updatedNations = this.gdpPopUpdater.syncGlobalStats(
      state.nations,
      allCells,
    );

    return {
      ...state,
      nations: updatedNations,
    };
  }
}
