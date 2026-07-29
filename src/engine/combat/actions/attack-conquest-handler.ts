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
import { AttackPowerCalculator } from "./attack-power-calculator";
import { AttackTreasurySettler } from "./attack-treasury-settler";

export class AttackConquestHandler implements ActionHandler {
  private orchestrator = new ConquestOrchestrator();
  private gdpPopUpdater = new GdpPopUpdater();
  private logWriter = new ConquestLogWriter();
  private baseFinder = new ClosestBaseFinder();
  private pathResolver = new NavalPathResolver();
  private coastalLocator = new CoastalPixelLocator();
  private logisticsEvaluator = new CampaignLogisticsEvaluator();
  private powerCalculator = new AttackPowerCalculator();
  private treasurySettler = new AttackTreasurySettler();

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

    const clickedPixel = attackAction.targetCoordinate ?? {
      x: attackAction.targetX ?? Math.floor(attackAction.infantry % 1024),
      y: attackAction.targetY ?? Math.floor(attackAction.airForce % 512),
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

    const finalAttackerPower = this.powerCalculator.calculateAttackerPower(
      attackAction,
      evalResult.supplyDeficitPenaltyMultiplier,
      attacker,
    );

    const defenderPower = this.powerCalculator.calculateDefenderPower(defender);

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
      {
        conquered: outcome.conqueredCells,
        capitulated: outcome.capitulatedCells,
        attackerLost: outcome.attackerLost,
        defenderLost: outcome.defenderLost,
        attackerRetreated: outcome.attackerRetreated,
        defenderRetreated: outcome.defenderRetreated,
        isVictory: outcome.isVictory,
      },
    );

    const syncedNations = this.gdpPopUpdater.syncGlobalStats(
      loggedState.nations,
      allCells,
    );

    const finalNations = this.treasurySettler.settlePostAttackStates(
      syncedNations,
      attacker.id,
      defender.id,
      evalResult,
      outcome.attackerLost,
      outcome.defenderLost,
    );

    return {
      ...loggedState,
      nations: finalNations,
    };
  }
}
