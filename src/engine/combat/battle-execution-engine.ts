import { GameState } from "@/domain/game/game-state.schema";
import { InitiateBattleAction } from "@/domain/game/action.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { BattleCalculator } from "./battle-calculator";
import { GridTerritoryCapturer } from "./grid-territory-capturer";
import { StateSynchronizerFacade } from "./state/state-synchronizer-facade";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { TurnLogBuilder } from "@/domain/game/turn-log-builder";

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

    const oilPrice = state.marketPrices?.oil || 25000000;

    const calcResult = BattleCalculator.calculateBattle(
      attacker,
      defender,
      action.dronesToLaunch,
      oilPrice,
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

    const isFullCapitulation =
      actualConqueredArea >= defender.geography.territorySize;

    const attackerTreasuryAfterDeployment =
      attacker.treasury - calcResult.deploymentMoneyCost;
    const attackerOilAfterDeployment = Math.max(
      0,
      attacker.resources.oil - calcResult.deploymentOilCost,
    );

    const updatedAttacker = {
      ...attacker,
      treasury: attackerTreasuryAfterDeployment + calcResult.treasuryLooted,
      resources: {
        ...attacker.resources,
        oil: attackerOilAfterDeployment,
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

    const reportTitle = calcResult.isAttackerVictory
      ? isFullCapitulation
        ? `فتح کامل و تسلیم ${defender.name}`
        : `پیروزی در تهاجم به ${defender.name}`
      : `عقب‌نشینی نیروها در نبرد با ${defender.name}`;

    const reportSummary = calcResult.isAttackerVictory
      ? isFullCapitulation
        ? `نیروهای ${attacker.name} با درهم‌شکستن کامل ساختار دفاعی ${defender.name}، تمام خاک قلمرو آن را فتح کردند.`
        : `نیروهای ${attacker.name} با موفقیت توانستند مساحت ${actualConqueredArea.toLocaleString("fa-IR")} کیلومتر مربع از خاک ${defender.name} را به همراه $${calcResult.treasuryLooted.toLocaleString("fa-IR")} غنیمت تصرف کنند.`
      : `پدافند و پیاده‌نظام ${defender.name} مانع پیشروی نیروهای ${attacker.name} شدند.`;

    const report: CombatReport = {
      id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      turn: state.currentTurn,
      timestamp: Date.now(),
      severity: isFullCapitulation ? "CRUSHING_VICTORY" : calcResult.severity,
      title: reportTitle,
      summary: reportSummary,
      attackerNationId: attacker.id,
      attackerName: attacker.name,
      defenderNationId: defender.id,
      defenderName: defender.name,
      attackerCasualties: calcResult.attackerCasualties,
      defenderCasualties: calcResult.defenderCasualties,
      conqueredAreaSqKm: actualConqueredArea,
      capitulatedAreaSqKm: isFullCapitulation ? actualConqueredArea : 0,
      strategicAssessment: `هزینه اعزام لجیستیک: $${calcResult.deploymentMoneyCost.toLocaleString("fa-IR")} + ${calcResult.deploymentOilCost.toLocaleString("fa-IR")} بلوک نفت | پشتیبانی هوایی: ${calcResult.airSupportMultiplier.toFixed(1)}x`,
      isVictory: calcResult.isAttackerVictory,
    };

    const logEntry = TurnLogBuilder.createLogEntry(
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
