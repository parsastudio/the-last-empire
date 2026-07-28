import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, AttackAction } from "@/domain/game/action.schema";
import { ActionHandler } from "@/engine/actions/action-handler";
import { GridState } from "@/engine/combat/state/grid-state";
import { ConquestOrchestrator } from "@/engine/combat/orchestrator/conquest-orchestrator";
import { GdpPopUpdater } from "@/engine/combat/state/gdp-pop-updater";
import { ConquestLogWriter } from "@/engine/combat/orchestrator/conquest-log-writer";
import { ClosestBaseFinder } from "@/engine/combat/routing/closest-base-finder";
import { NavalPathResolver } from "@/engine/combat/routing/naval-path-resolver";
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
      return state;
    }

    const isLandNeighbor = attacker.geography.landNeighbors.includes(
      defender.id,
    );

    const pixelPathLength = this.pathResolver.calculateNavalDistanceInPixels(
      closestBase,
      targetPixel,
      allCells,
    );

    const evalResult = this.logisticsEvaluator.evaluateCampaignLogistics(
      attacker,
      isLandNeighbor,
      pixelPathLength,
    );

    const baseAttackerPower =
      attackAction.infantry * 1.0 +
      attackAction.airForce * 3.0 +
      attackAction.droneMissile * 2.5;

    const finalAttackerPower = Math.floor(
      baseAttackerPower * evalResult.supplyDeficitPenaltyMultiplier,
    );

    const defenderPower =
      defender.military.infantry * 1.0 +
      defender.military.airForce * 3.0 +
      defender.military.droneMissile * 2.5;

    const outcome = this.orchestrator.executeAttack({
      attackerId: attacker.id,
      targetCountryId: defender.id,
      targetPixel,
      allCells,
      attackerForcePower: finalAttackerPower,
      defenderForcePower: defenderPower,
      defenderPopulation: defender.population,
      defenderStability: defender.government.stability,
    });

    const loggedState = this.logWriter.appendConquestLogs(
      state,
      attacker.id,
      defender.id,
      outcome.conqueredCells,
      outcome.capitulatedCells,
    );

    const updatedNations = this.gdpPopUpdater.syncGlobalStats(
      loggedState.nations,
      allCells,
    );

    const finalAttacker = updatedNations[attacker.id];
    if (finalAttacker) {
      const remainingTreasury = finalAttacker.treasury - evalResult.totalCost;
      updatedNations[attacker.id] = {
        ...finalAttacker,
        treasury: Math.max(0, remainingTreasury),
        nationalDebt:
          finalAttacker.nationalDebt + evalResult.emergencyDebtRequired,
        military: {
          ...finalAttacker.military,
          infantry: Math.max(
            0,
            finalAttacker.military.infantry - outcome.attackerLost,
          ),
        },
      };
    }

    const finalDefender = updatedNations[defender.id];
    if (finalDefender) {
      updatedNations[defender.id] = {
        ...finalDefender,
        military: {
          ...finalDefender.military,
          infantry: Math.max(
            0,
            finalDefender.military.infantry - outcome.defenderLost,
          ),
        },
      };
    }

    return {
      ...loggedState,
      nations: updatedNations,
    };
  }
}
