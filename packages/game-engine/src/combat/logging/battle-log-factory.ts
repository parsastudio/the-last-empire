import { TurnLogEntry } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { AllianceInterventionResult } from "@/engine/combat/alliance-intervention-evaluator";
import { CountryRegistry } from "@/domain/data/countries";
import { TurnLogBuilder } from "@/domain/shared/domain-utilities";

export class BattleLogFactory {
  public static createBattleLogs(
    currentTurn: number,
    attacker: Nation,
    defender: Nation,
    calcResult: BattleCalculationResult,
    betrayalPenaltyText: string,
    humanNationId: string,
  ): TurnLogEntry[] {
    const logs: TurnLogEntry[] = [];
    const canonicalHuman = CountryRegistry.resolveCanonicalId(humanNationId);
    const isAttackerHuman =
      CountryRegistry.resolveCanonicalId(attacker.id) === canonicalHuman;
    const isDefenderHuman =
      CountryRegistry.resolveCanonicalId(defender.id) === canonicalHuman;
    const isHumanInvolved = isAttackerHuman || isDefenderHuman;

    let nationalReport = "";
    if (calcResult.isAttackerVictory) {
      if (calcResult.isFullCapitulation) {
        nationalReport = `به دلیل برتری رزمی ${calcResult.valuationRatio} برابری ارتش، حاکمیت ${defender.name} به طور کامل فروپاشید و تمامی استان‌ها و غنائم تسلیحاتی تسخیر شدند.${betrayalPenaltyText}`;
      } else {
        nationalReport = `ارتش ${attacker.name} در نبرد با ${defender.name} پیروز شد و استان هدف را تصرف کرد (۲۵٪ نیروهای مجروح بازسازی شدند).${betrayalPenaltyText}`;
      }
    } else {
      nationalReport = `مدافعان ${defender.name} با مقاومت در خطوط پدافندی مانع پیشروی ارتش ${attacker.name} شدند.${betrayalPenaltyText}`;
    }

    if (isHumanInvolved) {
      const actorNation = isAttackerHuman ? attacker : defender;
      logs.push(
        TurnLogBuilder.createNationalLog(
          currentTurn,
          actorNation.id,
          "MILITARY",
          calcResult.isAttackerVictory
            ? isAttackerHuman
              ? "INFO"
              : "WARNING"
            : isAttackerHuman
              ? "WARNING"
              : "INFO",
          nationalReport,
          isAttackerHuman ? defender.id : attacker.id,
        ),
      );
    }

    let globalWarNews = "";
    if (calcResult.isAttackerVictory) {
      globalWarNews = `گزارش جبهه نبرد: ارتش ${attacker.name} موفق به شکست خطوط دفاعی ${defender.name} و تصرف قلمرو گردید.`;
    } else {
      globalWarNews = `گزارش جبهه نبرد: حمله سنگین ارتش ${attacker.name} به مواضع ${defender.name} با مقاومت مدافعان دفع شد.`;
    }

    logs.push(
      TurnLogBuilder.createGlobalWarLog(
        currentTurn,
        attacker.id,
        defender.id,
        globalWarNews,
        "COMBAT",
      ),
    );

    if (calcResult.isFullCapitulation) {
      const annexationMessage = `سقوط قطعی و تاریخی: کشور ${defender.name} پس از شکست کامل نظامی، به طور مطلق توسط امپراتوری ${attacker.name} تصرف و از جغرافیای جهان حذف شد.`;
      logs.push(
        TurnLogBuilder.createAnnexationLog(
          currentTurn,
          attacker.id,
          defender.id,
          annexationMessage,
        ),
      );
    }

    return logs;
  }

  public static createInterventionLogs(
    currentTurn: number,
    intervention: AllianceInterventionResult,
    attacker: Nation,
    defender: Nation,
    humanNationId: string,
  ): TurnLogEntry[] {
    const logs: TurnLogEntry[] = [];
    const canonicalHuman = CountryRegistry.resolveCanonicalId(humanNationId);

    for (const allyId of intervention.interveningAllyIds) {
      const ally = intervention.updatedNations[allyId];
      if (ally) {
        const msg = `دفاع جمعی متحدین: کشور ${ally.name} در راستای اجرای تعهدات اتحاد نظامی با ${defender.name}، به ارتش ${attacker.name} اعلان جنگ رسمی نمود.`;

        logs.push(
          TurnLogBuilder.createGlobalWarLog(
            currentTurn,
            ally.id,
            attacker.id,
            msg,
            "CRITICAL",
          ),
        );

        if (
          CountryRegistry.resolveCanonicalId(ally.id) === canonicalHuman ||
          CountryRegistry.resolveCanonicalId(attacker.id) === canonicalHuman ||
          CountryRegistry.resolveCanonicalId(defender.id) === canonicalHuman
        ) {
          logs.push(
            TurnLogBuilder.createNationalLog(
              currentTurn,
              ally.id,
              "DIPLOMACY",
              "CRITICAL",
              msg,
              attacker.id,
            ),
          );
        }
      }
    }

    for (const allyId of intervention.dishonoringAllyIds) {
      const ally = intervention.updatedNations[allyId];
      if (ally) {
        const msg = `پیمان‌شکنی دفاعی: کشور ${ally.name} از ترس رویارویی با ارتش ${attacker.name}، اتحاد خود با ${defender.name} را لغو کرد و بی‌طرف ماند.`;

        logs.push(
          TurnLogBuilder.createGlobalDiplomacyLog(
            currentTurn,
            ally.id,
            defender.id,
            msg,
            "WARNING",
          ),
        );

        if (
          CountryRegistry.resolveCanonicalId(ally.id) === canonicalHuman ||
          CountryRegistry.resolveCanonicalId(defender.id) === canonicalHuman
        ) {
          logs.push(
            TurnLogBuilder.createNationalLog(
              currentTurn,
              ally.id,
              "DIPLOMACY",
              "WARNING",
              msg,
              defender.id,
            ),
          );
        }
      }
    }

    return logs;
  }
}
