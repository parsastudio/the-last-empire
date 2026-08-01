import { GameState } from "@/domain/game/game-state.schema";
import { InitiateBattleAction } from "@/domain/game/action.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { BattleCalculator } from "./battle-calculator";
import { GridTerritoryCapturer } from "./grid-territory-capturer";
import { StateSynchronizerFacade } from "./state/state-synchronizer-facade";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { TurnLogBuilder } from "@/domain/game/turn-log-builder";
import { DiplomaticBetrayalCalculator } from "@/engine/diplomacy/diplomatic-betrayal-calculator";
import { ReputationManager } from "@/engine/diplomacy/reputation-manager";

export class BattleExecutionEngine {
  private territoryCapturer = new GridTerritoryCapturer();
  private synchronizer = new StateSynchronizerFacade();
  private betrayalCalculator = new DiplomaticBetrayalCalculator();
  private reputationManager = new ReputationManager();

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

    const currentRelation = attacker.relations[defender.id];
    const currentStance = currentRelation ? currentRelation.stance : "PEACE";

    const betrayalResult =
      this.betrayalCalculator.calculatePenalty(currentStance);

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

    let updatedAttacker = {
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

    if (betrayalResult.hasBetrayed) {
      updatedAttacker = this.reputationManager.applyReputationPenalty(
        updatedAttacker,
        betrayalResult.reputationPenalty,
      );
    }

    const attackerRelToDefender = updatedAttacker.relations[defender.id];
    if (attackerRelToDefender) {
      updatedAttacker.relations = {
        ...updatedAttacker.relations,
        [defender.id]: {
          ...attackerRelToDefender,
          stance: "PEACE",
          opinion: Math.min(-50, attackerRelToDefender.opinion - 40),
        },
      };
    }

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

    const defenderRelToAttacker = updatedDefender.relations[attacker.id];
    if (defenderRelToAttacker) {
      updatedDefender.relations = {
        ...updatedDefender.relations,
        [attacker.id]: {
          ...defenderRelToAttacker,
          stance: "PEACE",
          opinion: -100,
        },
      };
    }

    const reportTitle = calcResult.isAttackerVictory
      ? isFullCapitulation
        ? `فتح کامل و تسلیم ${defender.name}`
        : `پیروزی در تهاجم به قلمرو ${defender.name}`
      : `عقب‌نشینی نیروها در نبرد با ${defender.name}`;

    let betrayalText = "";
    if (betrayalResult.hasBetrayed) {
      betrayalText = ` [جریمه خیانت دیپلماتیک: -${betrayalResult.reputationPenalty} پرستیژ جهانی به دلیل نادیده گرفتن ${betrayalResult.skippedSteps} گام دیپلماتیک]`;
    }

    const reportSummary = calcResult.isAttackerVictory
      ? isFullCapitulation
        ? `نیروهای ${attacker.name} با درهم‌شکستن کامل دفاع ${defender.name}، تمام خاک آن را فتح کردند.${betrayalText}`
        : `نیروهای ${attacker.name} با موفقیت توانستند مساحت ${actualConqueredArea.toLocaleString("fa-IR")} کیلومتر مربع از قلمرو ${defender.name} را به همراه $${calcResult.treasuryLooted.toLocaleString("fa-IR")} غنیمت تصرف کنند.${betrayalText}`
      : `پدافند و پیاده‌نظام ${defender.name} مانع پیشروی نیروهای ${attacker.name} شدند.${betrayalText}`;

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
