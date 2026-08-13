import { GameState, TurnLogEntry } from "@/domain/game/game-state.schema";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";
import {
  DiplomaticBetrayalCalculator,
  ReputationManager,
} from "@/engine/diplomacy/diplomacy-engine";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";

type NationEntity = GameState["nations"][string];

export class BattleDiplomacyHelper {
  private static betrayalCalculator = new DiplomaticBetrayalCalculator();
  private static reputationManager = new ReputationManager();

  public static evaluateBetrayalPenalty(currentStance: DiplomaticStance) {
    return this.betrayalCalculator.calculatePenalty(currentStance);
  }

  public static applyReputationPenalty(
    nation: NationEntity,
    penalty: number,
  ): NationEntity {
    return this.reputationManager.applyReputationPenalty(nation, penalty);
  }

  public static buildBattleReportAndLog(
    state: GameState,
    attacker: NationEntity,
    defender: NationEntity,
    calcResult: BattleCalculationResult,
    conqueredPixels: number,
    isFullCapitulation: boolean,
    betrayalPenaltyText: string,
  ): { report: CombatReport; logEntry: TurnLogEntry } {
    const reportTitle = calcResult.isAttackerVictory
      ? isFullCapitulation
        ? `فروپاشی و تسلیم کامل ارتش ${defender.name}`
        : `پیروزی قاطع و فتح استان در نبرد با ${defender.name}`
      : `عقب‌نشینی نیروهای مهاجم در نبرد با ${defender.name}`;

    let reportSummary = "";
    if (calcResult.isAttackerVictory) {
      if (isFullCapitulation) {
        reportSummary = `ارتش ${defender.name} متحمل بیش از ۸۵٪ تلفات شده و کاملاً فروپاشید. تمام قلمرو این کشور به تصرف درآمد و ۵۰٪ غنائم تسلیحاتی و خزانه به ارتش شما منتقل شد.${betrayalPenaltyText}`;
      } else {
        reportSummary = `نیروهای ${attacker.name} با درهم‌شکستن خط دفاعی ${defender.name}، استان مورد نظر را به همراه $${calcResult.treasuryLooted.toLocaleString("fa-IR")} غنیمت فتح کردند.${betrayalPenaltyText}`;
      }
    } else {
      reportSummary = `پیاده‌نظام و تانک‌های ${defender.name} با مقاومت سرسختانه مانع پیشروی نیروهای ${attacker.name} شدند.${betrayalPenaltyText}`;
    }

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
      strategicAssessment: `هزینه اعزام لجیستیک: $${calcResult.deploymentMoneyCost.toLocaleString("fa-IR")} | پشتیبانی هوایی: ${calcResult.airSupportMultiplier.toFixed(1)}x`,
      isVictory: calcResult.isAttackerVictory,
    };

    const cleanNation = attacker.id.replace("NATION_", "");
    const randomSuffix = Math.random().toString(36).substring(2, 7);

    const logEntry: TurnLogEntry = {
      id: `log-${cleanNation}-t${state.currentTurn}-${randomSuffix}`,
      turn: state.currentTurn,
      timestamp: Date.now(),
      sourceNationId: attacker.id,
      level: calcResult.isAttackerVictory ? "INFO" : "WARNING",
      message: report.summary,
    };

    return { report, logEntry };
  }
}
