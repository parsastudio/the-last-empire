import type { GameState } from "@/domain/game/game-state.schema";
import type {
  GameAction,
  AttackAction,
} from "@/domain/game/action.schema";
import { CombatResolver } from "@/engine/combat/combat-resolver";
import { GeographyDistanceCalculator } from "@/engine/economy/geography-distance-calculator";
import { SeededRandom } from "@/domain/shared/seeded-random";
import { GameError } from "@/domain/shared/game-error";
import { CoolOffManager } from "@/engine/diplomacy/cool-off-manager";
import { PocketCombatCalculator } from "@/engine/diplomacy/pocket-combat-calculator";
import { NavalTransportCostCalculator } from "@/engine/military/naval-transport-cost-calculator";
import { AttackResultProcessor } from "./attack-result-processor";
import type { ActionHandler } from "./action-handler";

export class AttackActionHandler implements ActionHandler {
  private combatResolver = new CombatResolver();
  private distanceCalculator = new GeographyDistanceCalculator();
  private coolOffManager = new CoolOffManager();
  private pocketCalculator = new PocketCombatCalculator();
  private transportCostCalculator = new NavalTransportCostCalculator();
  private resultProcessor = new AttackResultProcessor();

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

    const activeCombatRelation =
      attacker.relations[attackAction.targetNationId];
    const currentStance = activeCombatRelation
      ? activeCombatRelation.stance
      : "PEACE";
    const coolOffTurns = activeCombatRelation
      ? activeCombatRelation.coolOffTurnsRemaining
      : 0;

    const penalties = this.coolOffManager.checkViolation(
      currentStance,
      "ATTACK",
      coolOffTurns,
    );
    let finalAttackerReputation = attacker.globalReputation;
    let finalAttackerStability = attacker.government.stability;

    if (penalties.reputationPenalty > 0 || penalties.stabilityPenalty > 0) {
      finalAttackerReputation = Math.max(
        -100,
        attacker.globalReputation - penalties.reputationPenalty,
      );
      finalAttackerStability = Math.max(
        0,
        attacker.government.stability - penalties.stabilityPenalty,
      );
    }

    const { airForce, infantry, droneMissile } = attackAction;

    if (
      attacker.military.infantry < infantry ||
      attacker.military.airForce < airForce ||
      attacker.military.droneMissile < droneMissile
    ) {
      throw new GameError(
        "INSUFFICIENT_RESOURCES",
        "Attacker does not possess requested deployment force",
      );
    }

    const distance = this.distanceCalculator.calculateDistance(
      attacker.id,
      defender.id,
      state.nations,
    );
    const isSeaOnly =
      attacker.geography.seaNeighbors.includes(defender.id) &&
      !attacker.geography.landNeighbors.includes(defender.id);

    let deploymentCost = 0;
    if (isSeaOnly) {
      const totalTroops = infantry + airForce + droneMissile;
      deploymentCost = this.transportCostCalculator.calculateNavalTransportCost(
        totalTroops,
        distance,
      );
    } else {
      const totalDeployedUnits = infantry + airForce + droneMissile;
      deploymentCost = Math.floor(
        totalDeployedUnits * 100 * Math.pow(1.12, distance - 1),
      );
    }

    if (attacker.treasury < deploymentCost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "Insufficient funds for logistics of this attack",
      );
    }

    const isDirectNeighbor =
      attacker.geography.landNeighbors.includes(defender.id) ||
      attacker.geography.seaNeighbors.includes(defender.id);

    let combatStrengthMultiplier = 1.0;
    if (!isDirectNeighbor) {
      const pocket = attacker.geography.isolatedPockets.find((p) =>
        p.territoryIds.some(
          (id) =>
            defender.geography.landNeighbors.includes(id) ||
            defender.geography.seaNeighbors.includes(id),
        ),
      );
      if (pocket) {
        combatStrengthMultiplier =
          this.pocketCalculator.getLogisticalCombatMultiplier(
            pocket.territorySize,
            attacker.geography.contiguousMainlandSize,
          );
      }
    }

    const attackForceStack = {
      infantry: Math.floor(infantry * combatStrengthMultiplier),
      airForce: Math.floor(airForce * combatStrengthMultiplier),
      droneMissile: Math.floor(droneMissile * combatStrengthMultiplier),
      experience: attacker.military.experience,
      techLevel: attacker.military.techLevel,
      mobility: attacker.military.mobility,
    };

    const updatedAttackerNation = {
      ...attacker,
      globalReputation: finalAttackerReputation,
      government: {
        ...attacker.government,
        stability: finalAttackerStability,
      },
      treasury: attacker.treasury - deploymentCost,
      military: {
        ...attacker.military,
        infantry: attacker.military.infantry - attackAction.infantry,
        airForce: attacker.military.airForce - attackAction.airForce,
        droneMissile:
          attacker.military.droneMissile - attackAction.droneMissile,
      },
    };

    let mixedSeed = state.seed;
    for (let i = 0; i < action.id.length; i++) {
      mixedSeed = (mixedSeed << 5) - mixedSeed + action.id.charCodeAt(i);
      mixedSeed |= 0;
    }
    const prng = new SeededRandom(Math.abs(mixedSeed));

    const combatResult = this.combatResolver.resolveCombat(
      updatedAttackerNation,
      defender,
      attackForceStack,
      prng,
    );

    const nextState = this.resultProcessor.process(
      state,
      updatedAttackerNation,
      defender,
      combatResult,
      infantry,
      airForce,
      droneMissile,
    );

    return {
      ...nextState,
      seed: prng.getSeed(),
    };
  }
}
