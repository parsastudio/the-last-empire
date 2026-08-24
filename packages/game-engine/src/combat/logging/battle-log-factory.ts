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
    isDefenderAnnexed = false,
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

    const outcome = calcResult.isAttackerVictory
      ? isCapitulationOutcome
        ? "CAPITULATION"
        : "VICTORY"
      : "DEFEAT";

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
          "BATTLE_TACTICAL_REPORT",
          {
            outcome,
            ratio: calcResult.valuationRatio,
            betrayalPenalty: betrayalPenaltyText ? 10 : 0,
          },
          isAttackerHuman ? defender.id : attacker.id,
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
