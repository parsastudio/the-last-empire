import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type {
  GameAction,
  RecruitUnitAction,
  DeclareWarAction,
  AttackAction,
} from "@/modules/game-engine/schemas/action.schema";
import { RecruitmentQueueManager } from "@/modules/military/domain/recruitment-queue";
import { CombatResolver } from "@/modules/combat/domain/combat-resolver";
import { TerritoryOccupationManager } from "@/modules/combat/domain/territory-occupation-manager";
import { WarExhaustionManager } from "@/modules/combat/domain/war-exhaustion-manager";
import { SeededRandom } from "@/core/math/seeded-random";
import { GameError } from "@/core/errors/game-error";
import { ActionHandler } from "./action-handler";

export class RecruitUnitActionHandler implements ActionHandler {
  private recruitmentManager = new RecruitmentQueueManager();

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "RECRUIT_UNIT") {
      return state;
    }
    const recruitAction = action as RecruitUnitAction;
    const source = state.nations[action.nationId];
    if (!source) {
      return state;
    }
    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]: this.recruitmentManager.enqueueOrder(
          source,
          recruitAction.unitType,
          recruitAction.quantity,
        ),
      },
    };
  }
}

export class DeclareWarActionHandler implements ActionHandler {
  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "DECLARE_WAR") {
      return state;
    }
    const warAction = action as DeclareWarAction;
    const source = state.nations[action.nationId];
    const target = state.nations[warAction.targetNationId];
    if (!source || !target || !target.isAlive) {
      return state;
    }

    const sourceRel = source.relations[warAction.targetNationId];
    const targetRel = target.relations[action.nationId];

    const updatedSource = {
      ...source,
      aggressionScore: Math.min(100, source.aggressionScore + 25),
      relations: {
        ...source.relations,
        ...(sourceRel
          ? {
              [warAction.targetNationId]: {
                ...sourceRel,
                stance: "WAR" as const,
              },
            }
          : {}),
      },
    };

    const updatedTarget = {
      ...target,
      relations: {
        ...target.relations,
        ...(targetRel
          ? {
              [action.nationId]: {
                ...targetRel,
                stance: "WAR" as const,
              },
            }
          : {}),
      },
    };

    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]: updatedSource,
        [warAction.targetNationId]: updatedTarget,
      },
    };
  }
}

export class AttackActionHandler implements ActionHandler {
  private combatResolver = new CombatResolver();
  private occupationManager = new TerritoryOccupationManager();
  private warExhaustionManager = new WarExhaustionManager();

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

    const { infantry, airForce, navy, droneMissile } = attackAction;

    if (
      attacker.military.infantry < infantry ||
      attacker.military.airForce < airForce ||
      attacker.military.navy < navy ||
      attacker.military.droneMissile < droneMissile
    ) {
      throw new GameError(
        "INSUFFICIENT_RESOURCES",
        "Attacker does not possess requested deployment force",
      );
    }

    const attackForceStack = {
      infantry,
      airForce,
      navy,
      droneMissile,
      experience: attacker.military.experience,
      techLevel: attacker.military.techLevel,
      mobility: attacker.military.mobility,
    };

    const updatedAttackerNation = {
      ...attacker,
      military: {
        ...attacker.military,
        infantry: attacker.military.infantry - infantry,
        airForce: attacker.military.airForce - airForce,
        navy: attacker.military.navy - navy,
        droneMissile: attacker.military.droneMissile - droneMissile,
      },
    };

    const prng = new SeededRandom(state.seed);
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
        navy:
          updatedAttackerNation.military.navy +
          combatResult.updatedAttackerMilitary.navy,
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
      logMessage += `Victory for Attacker! Occupied ${transfer.seizedTerritory} size territory and seized ${transfer.transferredTreasury} treasury.`;
    } else {
      logMessage += `Defender successfully defended their territory.`;
    }

    const updatedNations = {
      ...state.nations,
      [attacker.id]: {
        ...finalAttacker,
        aggressionScore: Math.min(100, finalAttacker.aggressionScore + 10),
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
