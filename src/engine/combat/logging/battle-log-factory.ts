import { TurnLogEntry } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { AllianceInterventionResult } from "@/engine/combat/alliance-intervention-evaluator";
import { CountryRegistry } from "@/domain/data/countries";

export class BattleLogFactory {
  public static createBattleSummaryLog(
    currentTurn: number,
    attacker: Nation,
    defender: Nation,
    calcResult: BattleCalculationResult,
    betrayalPenaltyText: string,
  ): TurnLogEntry {
    let reportSummary = "";
    if (calcResult.isAttackerVictory) {
      if (calcResult.isFullCapitulation) {
        reportSummary = `به دلیل برتری رزمی ${calcResult.valuationRatio} برابری ارتش شما، حاکمیت ${defender.name} به طور کامل فروپاشید. تمام استان‌ها تصرف شده و ۱۰۰٪ غنائم تسلیحاتی و خزانه به ارتش شما منتقل گردید (۲۵٪ نیروهای درگیر نیز به صفوف ارتش بازگشتند).${betrayalPenaltyText}`;
      } else {
        reportSummary = `نیروهای ${attacker.name} با پیروزی در فازهای نبرد، استان هدف را تصرف کردند. ۲۵٪ نیروهای مجروح دو طرف به ارتش‌ها بازگشتند و مدافع با استان‌های باقی‌مانده به مقاومت ادامه می‌دهد.${betrayalPenaltyText}`;
      }
    } else {
      reportSummary = `خطوط دفاعی ${defender.name} مانع پیشروی نیروهای ${attacker.name} شدند. ۲۵٪ از نیروهای مجروح و بازمانده به پایگاه‌ها بازگشتند.${betrayalPenaltyText}`;
    }

    const cleanNation = CountryRegistry.resolveCanonicalId(attacker.id);
    const randomSuffix = Math.random().toString(36).substring(2, 7);

    return {
      id: `log-${cleanNation}-t${currentTurn}-${randomSuffix}`,
      turn: currentTurn,
      timestamp: Date.now(),
      sourceNationId: attacker.id,
      level: calcResult.isAttackerVictory ? "INFO" : "WARNING",
      message: reportSummary,
    };
  }

  public static createInterventionLogs(
    currentTurn: number,
    intervention: AllianceInterventionResult,
    attacker: Nation,
    defender: Nation,
  ): TurnLogEntry[] {
    const logs: TurnLogEntry[] = [];

    for (const allyId of intervention.interveningAllyIds) {
      const ally = intervention.updatedNations[allyId];
      if (ally) {
        logs.push({
          id: `log-ally-war-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          turn: currentTurn,
          timestamp: Date.now(),
          sourceNationId: ally.id,
          level: "CRITICAL",
          message: `دفاع جمعی متحدین: کشور ${ally.name} در راستای اجرای تعهدات اتحاد نظامی با ${defender.name}، به ارتش ${attacker.name} اعلان جنگ رسمی نمود.`,
        });
      }
    }

    for (const allyId of intervention.dishonoringAllyIds) {
      const ally = intervention.updatedNations[allyId];
      if (ally) {
        logs.push({
          id: `log-ally-dishonor-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          turn: currentTurn,
          timestamp: Date.now(),
          sourceNationId: ally.id,
          level: "WARNING",
          message: `پیمان‌شکنی دفاعی: کشور ${ally.name} از ترس رویارویی با ارتش ${attacker.name}، اتحاد خود با ${defender.name} را لغو کرد و بی‌طرف ماند.`,
        });
      }
    }

    return logs;
  }
}
