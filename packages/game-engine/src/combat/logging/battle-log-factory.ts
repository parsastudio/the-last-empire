import { TurnLogEntry } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { AllianceInterventionResult } from "@/engine/combat/alliance-intervention-evaluator";
import { CountryRegistry } from "@/domain/data/countries";
import { TurnLogBuilder } from "@/domain/shared/domain-utilities";
import { Province } from "@/domain/province/province.schema";

export class BattleLogFactory {
  public static createBattleLogs(
    currentTurn: number,
    attacker: Nation,
    defender: Nation,
    calcResult: BattleCalculationResult,
    betrayalPenaltyText: string,
    humanNationId: string,
    isDefenderAnnexed = false,
    targetProvince?: Province | null,
    attackType: "LAND" | "NAVAL" = "LAND",
  ): TurnLogEntry[] {
    const logs: TurnLogEntry[] = [];
    const canonicalHuman = CountryRegistry.resolveCanonicalId(humanNationId);
    const isAttackerHuman =
      CountryRegistry.resolveCanonicalId(attacker.id) === canonicalHuman;
    const isDefenderHuman =
      CountryRegistry.resolveCanonicalId(defender.id) === canonicalHuman;
    const isHumanInvolved = isAttackerHuman || isDefenderHuman;

    const isCapitulationOutcome =
      calcResult.isFullCapitulation || isDefenderAnnexed;

    let humanHeadline = "";
    let outcome = "DEFEAT";

    if (isAttackerHuman) {
      if (isCapitulationOutcome) {
        outcome = "CAPITULATION";
        humanHeadline = `پیروزی ویرانگر و فتح کامل ارتش مقابل ${defender.name}`;
      } else if (calcResult.isAttackerVictory) {
        outcome = "VICTORY";
        humanHeadline = `پیروزی نظامی و پیشروی ارتش در نبرد با ${defender.name}`;
      } else {
        outcome = "DEFEAT";
        humanHeadline = `شکست عملیات تهاجمی و عقب‌نشینی مقابل ${defender.name}`;
      }
    } else if (isDefenderHuman) {
      if (isCapitulationOutcome) {
        outcome = "CAPITULATION";
        humanHeadline = `سقوط خطوط دفاعی و فروپاشی استان‌ها توسط ارتش ${attacker.name}`;
      } else if (!calcResult.isAttackerVictory) {
        outcome = "DEFENDED";
        humanHeadline = `دفاع جانانه و دفع قاطع تهاجم ارتش ${attacker.name}`;
      } else {
        outcome = "DEFEAT";
        humanHeadline = `شکست سنگین خط دفاعی و واگذاری مواضع به ارتش ${attacker.name}`;
      }
    }

    const fullReportData = {
      attackerId: attacker.id,
      defenderId: defender.id,
      targetProvinceName: targetProvince?.nameFa,
      attackType,
      isAttackerVictory: calcResult.isAttackerVictory,
      isFullCapitulation: isCapitulationOutcome,
      valuationRatio: calcResult.valuationRatio,
      treasuryLooted: calcResult.treasuryLooted,
      attackerCasualties: calcResult.attackerCasualties,
      defenderCasualties: calcResult.defenderCasualties,
      phase1Missile: calcResult.phase1Missile,
      phase2Air: calcResult.phase2Air,
      phase3Ground: calcResult.phase3Ground,
    };

    if (isHumanInvolved) {
      const actorNation = isAttackerHuman ? attacker : defender;
      const targetNation = isAttackerHuman ? defender : attacker;

      const isPositiveOutcome =
        (isAttackerHuman && calcResult.isAttackerVictory) ||
        (isDefenderHuman && !calcResult.isAttackerVictory);

      logs.push(
        TurnLogBuilder.createNationalLog(
          currentTurn,
          actorNation.id,
          "MILITARY",
          isPositiveOutcome ? "INFO" : "CRITICAL",
          "BATTLE_TACTICAL_REPORT",
          {
            outcome,
            humanHeadline,
            ratio: calcResult.valuationRatio,
            betrayalPenalty: betrayalPenaltyText ? 10 : 0,
            reportJson: JSON.stringify(fullReportData),
          },
          targetNation.id,
        ),
      );
    }

    logs.push(
      TurnLogBuilder.createGlobalWarLog(
        currentTurn,
        attacker.id,
        defender.id,
        "BATTLE_GLOBAL_NEWS",
        {
          outcome: calcResult.isAttackerVictory ? "VICTORY" : "DEFENDED",
          reportJson: JSON.stringify(fullReportData),
        },
        "COMBAT",
      ),
    );

    if (isCapitulationOutcome && calcResult.isAttackerVictory) {
      logs.push(
        TurnLogBuilder.createAnnexationLog(
          currentTurn,
          attacker.id,
          defender.id,
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
        logs.push(
          TurnLogBuilder.createGlobalWarLog(
            currentTurn,
            ally.id,
            attacker.id,
            "ALLIANCE_INTERVENTION",
            {},
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
              "ALLIANCE_INTERVENTION",
              {},
              attacker.id,
            ),
          );
        }
      }
    }

    for (const allyId of intervention.dishonoringAllyIds) {
      const ally = intervention.updatedNations[allyId];
      if (ally) {
        logs.push(
          TurnLogBuilder.createGlobalDiplomacyLog(
            currentTurn,
            ally.id,
            defender.id,
            "ALLIANCE_BETRAYED",
            {},
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
              "ALLIANCE_BETRAYED",
              {},
              defender.id,
            ),
          );
        }
      }
    }

    return logs;
  }
}
