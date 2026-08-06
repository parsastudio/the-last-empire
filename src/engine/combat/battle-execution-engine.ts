import { GameState } from "@/domain/game/game-state.schema";
import { InitiateBattleAction } from "@/domain/game/action.schema";
import { BattleCalculator } from "@/engine/combat/battle-calculator";
import { BitPackedStateFacade } from "@/engine/combat/final/bit-packed-state-facade";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import {
  TurnLogBuilder,
  NationIdResolver,
} from "@/domain/shared/domain-utilities";
import {
  DiplomaticBetrayalCalculator,
  ReputationManager,
} from "@/engine/diplomacy/diplomacy-domain.service";

export class BattleExecutionEngine {
  private facade = new BitPackedStateFacade();
  private betrayalCalculator = new DiplomaticBetrayalCalculator();
  private reputationManager = new ReputationManager();

  public executeBattle(
    state: GameState,
    action: InitiateBattleAction,
  ): GameState {
    const canonicalAttackerId = NationIdResolver.resolveCanonicalId(
      action.nationId,
    );
    const canonicalDefenderId = NationIdResolver.resolveCanonicalId(
      action.targetNationId,
    );

    const attacker =
      state.nations[action.nationId] || state.nations[canonicalAttackerId];
    const defender =
      state.nations[action.targetNationId] ||
      state.nations[canonicalDefenderId];

    if (!attacker || !defender || !attacker.isAlive || !defender.isAlive) {
      return state;
    }

    const currentRelation =
      attacker.relations[defender.id] ||
      attacker.relations[canonicalDefenderId];
    const currentStance = currentRelation
      ? currentRelation.stance
      : "NORMAL_DIPLOMACY";

    const betrayalResult =
      this.betrayalCalculator.calculatePenalty(currentStance);

    const oilPrice = state.marketPrices?.oil || 25000000;

    const calcResult = BattleCalculator.calculateBattle(
      attacker,
      defender,
      action.dronesToLaunch,
      oilPrice,
    );

    const defenderPixels = defender.geography.territoryPixelCount;
    const requestedTargetPixels = calcResult.isAttackerVictory
      ? Math.min(calcResult.conqueredPixelsCount, defenderPixels)
      : 0;

    let actualConqueredPixels = 0;
    if (requestedTargetPixels > 0) {
      actualConqueredPixels = this.facade.conquerAndRefreshed(
        NationIdResolver.resolveNumericId(attacker.id),
        NationIdResolver.resolveNumericId(defender.id),
        requestedTargetPixels,
      );
    }

    const conqueredPixels =
      actualConqueredPixels > 0 ? actualConqueredPixels : requestedTargetPixels;

    const conquestRatio =
      defenderPixels > 0
        ? Math.min(1.0, conqueredPixels / defenderPixels)
        : 1.0;

    const popTransferred = Math.floor(defender.population * conquestRatio);
    const gdpTransferred = Math.floor(defender.gdp * conquestRatio);

    const newDefenderPixels = Math.max(0, defenderPixels - conqueredPixels);
    const newDefenderPop = Math.max(0, defender.population - popTransferred);
    const newDefenderGdp = Math.max(0, defender.gdp - gdpTransferred);
    const isDefenderAlive = newDefenderPixels > 0 && newDefenderPop > 0;

    const isFullCapitulation = !isDefenderAlive || newDefenderPixels === 0;

    const attackerTreasuryAfterDeployment =
      attacker.treasury - calcResult.deploymentMoneyCost;
    const attackerOilAfterDeployment = Math.max(
      0,
      attacker.resources.oil - calcResult.deploymentOilCost,
    );

    let updatedAttacker = {
      ...attacker,
      gdp: attacker.gdp + gdpTransferred,
      population: attacker.population + popTransferred,
      treasury: attackerTreasuryAfterDeployment + calcResult.treasuryLooted,
      resources: {
        ...attacker.resources,
        oil: attackerOilAfterDeployment,
      },
      geography: {
        ...attacker.geography,
        territoryPixelCount:
          attacker.geography.territoryPixelCount + conqueredPixels,
        contiguousMainlandPixelCount:
          attacker.geography.contiguousMainlandPixelCount + conqueredPixels,
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

    const attackerRelKey = attacker.relations[defender.id]
      ? defender.id
      : canonicalDefenderId;
    const attackerRelToDefender = updatedAttacker.relations[attackerRelKey];
    if (attackerRelToDefender) {
      updatedAttacker.relations = {
        ...updatedAttacker.relations,
        [attackerRelKey]: {
          ...attackerRelToDefender,
          stance: "WAR",
          isTradeEmbargoed: true,
          opinion: Math.min(-50, attackerRelToDefender.opinion - 40),
        },
      };
    }

    const updatedDefender = {
      ...defender,
      isAlive: isDefenderAlive,
      gdp: newDefenderGdp,
      population: newDefenderPop,
      treasury: Math.max(0, defender.treasury - calcResult.treasuryLooted),
      geography: {
        ...defender.geography,
        territoryPixelCount: newDefenderPixels,
        contiguousMainlandPixelCount: newDefenderPixels,
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

    const defenderRelKey = defender.relations[attacker.id]
      ? attacker.id
      : canonicalAttackerId;
    const defenderRelToAttacker = updatedDefender.relations[defenderRelKey];
    if (defenderRelToAttacker) {
      updatedDefender.relations = {
        ...updatedDefender.relations,
        [attacker.id]: {
          ...defenderRelToAttacker,
          stance: "WAR",
          isTradeEmbargoed: true,
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
      betrayalText = ` [جریمه خیانت دیپلماتیک: -${betrayalResult.reputationPenalty} پرستیژ جهانی]`;
    }

    const reportSummary = calcResult.isAttackerVictory
      ? isFullCapitulation
        ? `نیروهای ${attacker.name} با درهم‌شکستن کامل دفاع ${defender.name}، تمام خاک آن را فتح کردند.${betrayalText}`
        : `نیروهای ${attacker.name} با موفقیت توانستند ${conqueredPixels.toLocaleString("fa-IR")} پیکسل از قلمرو ${defender.name} را به همراه $${calcResult.treasuryLooted.toLocaleString("fa-IR")} غنیمت تصرف کنند.${betrayalText}`
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
      conqueredPixelsCount: conqueredPixels,
      capitulatedPixelsCount: isFullCapitulation ? conqueredPixels : 0,
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

    return this.facade.syncGameState(syncedState);
  }
}
