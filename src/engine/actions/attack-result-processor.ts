import type { GameState } from "@/domain/game/game-state.schema";
import type { Nation } from "@/domain/nation/nation.schema";
import type { CombatResult } from "@/engine/combat/combat-resolver";
import { TerritoryOccupationManager } from "@/engine/combat/territory-occupation-manager";
import { WarExhaustionManager } from "@/engine/combat/war-exhaustion-manager";
import { LootCalculator } from "@/engine/diplomacy/loot-calculator";

export class AttackResultProcessor {
  private occupationManager = new TerritoryOccupationManager();
  private warExhaustionManager = new WarExhaustionManager();
  private lootCalculator = new LootCalculator();

  public process(
    state: GameState,
    attacker: Nation,
    defender: Nation,
    combatResult: CombatResult,
    deployedInfantry: number,
    deployedAirForce: number,
    deployedDrones: number,
  ): GameState {
    let finalAttacker = {
      ...attacker,
      military: {
        ...attacker.military,
        infantry:
          attacker.military.infantry +
          combatResult.updatedAttackerMilitary.infantry,
        airForce:
          attacker.military.airForce +
          combatResult.updatedAttackerMilitary.airForce,
        droneMissile:
          attacker.military.droneMissile +
          combatResult.updatedAttackerMilitary.droneMissile,
      },
    };

    let finalDefender = {
      ...defender,
      military: combatResult.updatedDefenderMilitary,
    };

    const attackerKilledInfantry =
      deployedInfantry - combatResult.updatedAttackerMilitary.infantry;
    const attackerKilledAir =
      deployedAirForce - combatResult.updatedAttackerMilitary.airForce;
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
        if (actualPocket) {
          targetLoot = this.lootCalculator.calculateLoot(
            finalDefender.treasury,
            actualPocket.territorySize,
            finalDefender.geography.contiguousMainlandSize,
            0.25,
          );
        }
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
      nations: updatedNations,
      turnLogs: [...state.turnLogs, logEntry],
    };
  }
}
