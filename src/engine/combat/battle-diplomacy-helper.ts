import { GameState, TurnLogEntry } from "@/domain/game/game-state.schema";
import { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";
import { DiplomaticBetrayalCalculator } from "@/engine/diplomacy/diplomacy-engine";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";

type NationEntity = GameState["nations"][string];

export class BattleDiplomacyHelper {
  private static betrayalCalculator = new DiplomaticBetrayalCalculator();

  public static evaluateBetrayalPenalty(currentStance: DiplomaticStance) {
    return this.betrayalCalculator.calculatePenalty(currentStance);
  }

  public static buildBattleReportAndLog(
    state: GameState,
    attacker: NationEntity,
    defender: NationEntity,
    calcResult: BattleCalculationResult,
    isFullCapitulation: boolean,
    betrayalPenaltyText: string,
  ): { logEntry: TurnLogEntry } {
    let reportSummary = "";
    if (calcResult.isAttackerVictory) {
      if (isFullCapitulation) {
        reportSummary = `به دلیل برتری رزمی ${calcResult.valuationRatio} برابری ارتش شما، حاکمیت ${defender.name} به طور کامل فروپاشید. تمام استان‌ها تصرف شده و ۱۰۰٪ غنائم تسلیحاتی و خزانه به ارتش شما منتقل گردید (۲۵٪ نیروهای درگیر نیز به صفوف ارتش بازگشتند).${betrayalPenaltyText}`;
      } else {
        reportSummary = `نیروهای ${attacker.name} با پیروزی در فازهای نبرد، استان هدف را تصرف کردند. ۲۵٪ نیروهای مجروح دو طرف به ارتش‌ها بازگشتند و مدافع با استان‌های باقی‌مانده به مقاومت ادامه می‌دهد.${betrayalPenaltyText}`;
      }
    } else {
      reportSummary = `خطوط دفاعی ${defender.name} مانع پیشروی نیروهای ${attacker.name} شدند. ۲۵٪ از نیروهای مجروح و بازمانده به پایگاه‌ها بازگشتند.${betrayalPenaltyText}`;
    }

    const cleanNation = attacker.id.replace("NATION_", "");
    const randomSuffix = Math.random().toString(36).substring(2, 7);

    const logEntry: TurnLogEntry = {
      id: `log-${cleanNation}-t${state.currentTurn}-${randomSuffix}`,
      turn: state.currentTurn,
      timestamp: Date.now(),
      sourceNationId: attacker.id,
      level: calcResult.isAttackerVictory ? "INFO" : "WARNING",
      message: reportSummary,
    };

    return { logEntry };
  }
}
