import { GameState } from "@/domain/game/game-state.schema";
import { InitiateBattleAction } from "@/domain/game/action.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { BattleCalculator } from "./battle-calculator";
import { GridTerritoryCapturer } from "./grid-territory-capturer";
import { StateSynchronizerFacade } from "./state/state-synchronizer-facade";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { EventSystem } from "@/engine/politics/event-system";

export class BattleExecutionEngine {
  private territoryCapturer = new GridTerritoryCapturer();
  private synchronizer = new StateSynchronizerFacade();

  public executeBattle(
    state: GameState,
    action: InitiateBattleAction,
    gridState: GridState,
  ): GameState {
    const attacker = state.nations[action.nationId];
    const defender = state.nations[action.targetNationId];

    if (!attacker || !defender || !attacker.isAlive || !defender.isAlive) {
      return state;
    }

    const calcResult = BattleCalculator.calculateBattle(
      attacker,
      defender,
      action.dronesToLaunch,
    );

    let actualConqueredArea = 0;
    if (calcResult.isAttackerVictory && calcResult.conqueredAreaSqKm > 0) {
      actualConqueredArea = this.territoryCapturer.captureTerritory(
        action.nationId,
        action.targetNationId,
        calcResult.conqueredAreaSqKm,
        gridState,
      );
    }

    const attackerWoundedRecovered = Math.floor(
      calcResult.attackerCasualties.infantryLost * 0.4,
    );
    const defenderWoundedRecovered = Math.floor(
      calcResult.defenderCasualties.infantryLost * 0.4,
    );

    const updatedAttacker = {
      ...attacker,
      treasury: attacker.treasury + calcResult.treasuryLooted,
      resources: {
        ...attacker.resources,
        manpower: attacker.resources.manpower + attackerWoundedRecovered,
      },
      military: {
        ...attacker.military,
        infantry: Math.max(
          0,
          attacker.military.infantry -
            calcResult.attackerCasualties.infantryLost,
        ),
        airForce: Math.max(
          0,
          attacker.military.airForce -
            calcResult.attackerCasualties.airForceLost,
        ),
        droneMissile: Math.max(
          0,
          attacker.military.droneMissile - calcResult.dronesUsed,
        ),
        experience: Math.min(100, attacker.military.experience + 5),
      },
    };

    const updatedDefender = {
      ...defender,
      treasury: defender.treasury - calcResult.treasuryLooted,
      resources: {
        ...defender.resources,
        manpower: defender.resources.manpower + defenderWoundedRecovered,
      },
      military: {
        ...defender.military,
        infantry: Math.max(
          0,
          defender.military.infantry -
            calcResult.defenderCasualties.infantryLost,
        ),
        airForce: Math.max(
          0,
          defender.military.airForce -
            calcResult.defenderCasualties.airForceLost,
        ),
        experience: Math.min(100, defender.military.experience + 3),
      },
    };

    const report: CombatReport = {
      id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      turn: state.currentTurn,
      timestamp: Date.now(),
      severity: calcResult.severity,
      title: calcResult.isAttackerVictory
        ? `پیروزی در تهاجم به ${defender.name}`
        : `عقب‌نشینی نیروها در نبرد با ${defender.name}`,
      summary: calcResult.isAttackerVictory
        ? `نیروهای ${attacker.name} موفق به شکست خطوط دفاعی ${defender.name} شدند و مساحت ${actualConqueredArea.toLocaleString("fa-IR")} کیلومتر مربع به همراه ${calcResult.treasuryLooted.toLocaleString("fa-IR")} دلار غنیمت کسب کردند.`
        : `پدافند و پیاده‌نظام ${defender.name} مانع پیشروی نیروهای ${attacker.name} شدند.`,
      attackerNationId: attacker.id,
      attackerName: attacker.name,
      defenderNationId: defender.id,
      defenderName: defender.name,
      attackerCasualties: calcResult.attackerCasualties,
      defenderCasualties: calcResult.defenderCasualties,
      conqueredAreaSqKm: actualConqueredArea,
      capitulatedAreaSqKm: 0,
      strategicAssessment: `پهپادهای شلیک‌شده: ${calcResult.dronesUsed} | ضریب پشتیبانی هوایی: ${calcResult.airSupportMultiplier.toFixed(1)}x`,
      isVictory: calcResult.isAttackerVictory,
    };

    const logEntry = EventSystem.createLogEntry(
      state.currentTurn,
      attacker.id,
      calcResult.isAttackerVictory ? "INFO" : "WARNING",
      report.summary,
    );

    const tempNations = {
      ...state.nations,
      [attacker.id]: updatedAttacker,
      [defender.id]: updatedDefender,
    };

    const syncedState: GameState = {
      ...state,
      nations: tempNations,
      turnLogs: [...state.turnLogs, logEntry],
    };

    return this.synchronizer.synchronizeAll(syncedState, gridState);
  }
}
