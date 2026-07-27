import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, AttackAction } from "@/domain/game/action.schema";
import { ActionHandler } from "@/engine/actions/action-handler";
import { GridState } from "@/engine/combat/state/grid-state";
import { ConquestOrchestrator } from "@/engine/combat/orchestrator/conquest-orchestrator";
import { GdpPopUpdater } from "@/engine/combat/state/gdp-pop-updater";
import { ConquestLogWriter } from "@/engine/combat/orchestrator/conquest-log-writer";
import { ClosestBaseFinder } from "@/engine/combat/routing/closest-base-finder";
import { NavalPathResolver } from "@/engine/combat/routing/naval-path-resolver";
import { GameError } from "@/domain/shared/game-error";
import { CoastalPixelLocator } from "./coastal-pixel-locator";
import { CampaignLogisticsEvaluator } from "./campaign-logistics-evaluator";

export class AttackConquestHandler implements ActionHandler {
  private orchestrator = new ConquestOrchestrator();
  private gdpPopUpdater = new GdpPopUpdater();
  private logWriter = new ConquestLogWriter();
  private baseFinder = new ClosestBaseFinder();
  private pathResolver = new NavalPathResolver();
  private coastalLocator = new CoastalPixelLocator();
  private logisticsEvaluator = new CampaignLogisticsEvaluator();

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

    const clickedPixel = {
      x: Math.floor(attackAction.infantry % 1024),
      y: Math.floor(attackAction.airForce % 512),
    };

    const targetPixel = this.coastalLocator.locateClosest(
      defender.id,
      clickedPixel,
      allCells,
    );

    const closestBase = this.baseFinder.findClosestBase(
      attacker.id,
      targetPixel,
      allCells,
    );

    if (!closestBase) {
      throw new GameError(
        "INVALID_ACTION",
        "Operational military command base not found to initiate theater deployment.",
      );
    }

    const isLandNeighbor = attacker.geography.landNeighbors.includes(
      defender.id,
    );

    const pixelPathLength = this.pathResolver.calculateNavalDistanceInPixels(
      closestBase,
      targetPixel,
      allCells,
    );

    const totalCampaignCost =
      this.logisticsEvaluator.calculateTotalCampaignCost(
        attacker,
        isLandNeighbor,
        pixelPathLength,
      );

    if (totalCampaignCost === -1) {
      throw new GameError(
        "INVALID_ACTION",
        "Target is geographically unreachable. No valid land or naval transit routes detected.",
      );
    }

    if (attacker.treasury < totalCampaignCost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        `Insufficient sovereign treasury to finance this campaign. Required: $${totalCampaignCost.toLocaleString()}`,
      );
    }

    const result = this.orchestrator.executeAttack(
      attacker.id,
      defender.id,
      targetPixel,
      allCells,
    );

    const loggedState = this.logWriter.appendConquestLogs(
      state,
      attacker.id,
      defender.id,
      result.conqueredCells,
      result.capitulatedCells,
    );

    const updatedNations = this.gdpPopUpdater.syncGlobalStats(
      loggedState.nations,
      allCells,
    );

    const finalAttacker = updatedNations[attacker.id];
    if (finalAttacker) {
      updatedNations[attacker.id] = {
        ...finalAttacker,
        treasury: finalAttacker.treasury - totalCampaignCost,
      };
    }

    return {
      ...loggedState,
      nations: updatedNations,
    };
  }
}
