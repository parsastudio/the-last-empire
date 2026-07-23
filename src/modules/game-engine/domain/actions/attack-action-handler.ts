import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type {
  GameAction,
  AttackAction,
} from "@/modules/game-engine/schemas/action.schema";
import { CombatResolver } from "@/modules/combat/domain/combat-resolver";
import { TerritoryOccupationManager } from "@/modules/combat/domain/territory-occupation-manager";
import { WarExhaustionManager } from "@/modules/combat/domain/war-exhaustion-manager";
import { GeographyDistanceCalculator } from "@/modules/economy/domain/geography-distance-calculator";
import { SeededRandom } from "@/core/math/seeded-random";
import { GameError } from "@/core/errors/game-error";
import { CoolOffManager } from "@/modules/diplomacy/domain/cool-off-manager";
import { PocketCombatCalculator } from "@/modules/diplomacy/domain/pocket-combat-calculator";
import { NavalTransportCostCalculator } from "@/modules/military/domain/naval-transport-cost-calculator";
import { LootCalculator } from "@/modules/diplomacy/domain/loot-calculator";
import { ConnectivityGraph } from "@/modules/diplomacy/domain/connectivity-graph";
import type { ActionHandler } from "./action-handler";

export class AttackActionHandler implements ActionHandler {
  private combatResolver = new CombatResolver();
  private occupationManager = new TerritoryOccupationManager();
  private warExhaustionManager = new WarExhaustionManager();
  private distanceCalculator = new GeographyDistanceCalculator();
  private coolOffManager = new CoolOffManager();
  private pocketCalculator = new PocketCombatCalculator();
  private transportCostCalculator = new NavalTransportCostCalculator();
  private lootCalculator = new LootCalculator();
  private connectivityGraph = new ConnectivityGraph();

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

    const penalties = this.coolOffManager.checkViolation(
      currentStance,
      "ATTACK",
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

    let finalAttacker = {
      ...updatedAttackerNation,
      military: {
        ...updatedAttackerNation.military,
        infantry:
          updatedAttackerNation.military.infantry +
          combatResult.updatedAttackerMilitary.infantry,
        airForce:
          updatedAttackerNation.military.airForce +
          combatResult.updatedAttackerMilitary.airForce,
        droneMissile:
          updatedAttackerNation.military.droneMissile +
          combatResult.updatedAttackerMilitary.droneMissile,
      },
    };

    let finalDefender = {
      ...defender,
      military: combatResult.updatedDefenderMilitary,
    };

    const attackerKilledInfantry =
      infantry - combatResult.updatedAttackerMilitary.infantry;
    const attackerKilledAir =
      airForce - combatResult.updatedAttackerMilitary.airForce;
    const attackerTotalCasualties = attackerKilledInfantry + attackerKilledAir;
    const defenderKilledInfantry =
      defender.military.infantry -
      combatResult.updatedDefenderMilitary.infantry;
    const defenderKilledAir =
      defender.military.airForce -
      combatResult.updatedDefenderMilitary.airForce;
    const defenderTotalCasualties = defenderKilledInfantry + defenderKilledAir;

    finalAttacker = this.warExhaustionManager.incrementWarExhaustion(
      finalAttacker,
      attackerTotalCasualties,
    );
    finalDefender = this.warExhaustionManager.incrementWarExhaustion(
      finalDefender,
      defenderTotalCasualties,
    );

    let logMessage = `Battle occurred. Attacker: ${attacker.name}, Defender: ${defender.name}. `;
    if (combatResult.attackerWon) {
      const transfer = this.occupationManager.processVictoryOccupation(
        finalAttacker,
        finalDefender,
        0.25,
      );
      finalAttacker = transfer.winner;
      finalDefender = transfer.loser;

      let targetLoot = 0;
      if (finalDefender.geography.isolatedPockets.length > 0) {
        const actualPocket = finalDefender.geography.isolatedPockets[0];
        targetLoot = this.lootCalculator.calculateLoot(
          finalDefender.treasury,
          actualPocket.territorySize,
          finalDefender.geography.contiguousMainlandSize,
          0.25,
        );
      }

      finalAttacker.treasury += targetLoot;
      finalDefender.treasury = Math.max(0, finalDefender.treasury - targetLoot);

      logMessage += `Victory for Attacker! Occupied ${transfer.seizedTerritory} size territory and seized ${transfer.transferredTreasury} treasury and looted ${targetLoot} as pocket resources.`;

      const isContiguousNeighbor = attacker.geography.landNeighbors.includes(
        defender.id,
      );

      if (isContiguousNeighbor) {
        finalAttacker.geography.contiguousMainlandSize +=
          transfer.seizedTerritory;
        finalDefender.geography.contiguousMainlandSize = Math.max(
          0,
          finalDefender.geography.contiguousMainlandSize -
            transfer.seizedTerritory,
        );
      } else {
        const newPocket = {
          id: `pocket-conquered-${defender.id}-${Date.now()}`,
          territorySize: transfer.seizedTerritory,
          territoryIds: [defender.id],
        };
        finalAttacker.geography.isolatedPockets = [
          ...finalAttacker.geography.isolatedPockets,
          newPocket,
        ];

        if (finalDefender.geography.isolatedPockets.length > 0) {
          let remainingLoss = transfer.seizedTerritory;
          const updatedPockets = [];
          for (const pocket of finalDefender.geography.isolatedPockets) {
            if (remainingLoss <= 0) {
              updatedPockets.push(pocket);
            } else if (pocket.territorySize > remainingLoss) {
              updatedPockets.push({
                ...pocket,
                territorySize: pocket.territorySize - remainingLoss,
              });
              remainingLoss = 0;
            } else {
              remainingLoss -= pocket.territorySize;
            }
          }
          finalDefender.geography.isolatedPockets = updatedPockets;
          if (remainingLoss > 0) {
            finalDefender.geography.contiguousMainlandSize = Math.max(
              0,
              finalDefender.geography.contiguousMainlandSize - remainingLoss,
            );
          }
        } else {
          finalDefender.geography.contiguousMainlandSize = Math.max(
            0,
            finalDefender.geography.contiguousMainlandSize -
              transfer.seizedTerritory,
          );
        }
      }
    } else {
      logMessage += `Defender successfully defended their territory.`;
    }

    const updatedNations = {
      ...state.nations,
      [attacker.id]: {
        ...finalAttacker,
        globalAggression: Math.min(100, finalAttacker.globalAggression + 10),
      },
      [defender.id]: finalDefender,
    };

    const logEntry = {
      id: `combat-${state.currentTurn}-${Date.now()}`,
      turn: state.currentTurn,
      timestamp: Date.now(),
      sourceNationId: attacker.id,
      targetNationId: defender.id,
      level: "COMBAT" as const,
      message: logMessage,
    };

    return {
      ...state,
      seed: prng.getSeed(),
      nations: updatedNations,
      turnLogs: [...state.turnLogs, logEntry],
    };
  }
}
