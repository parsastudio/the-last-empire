import { TurnLogEntry } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { TurnLogBuilder } from "@/domain/shared/domain-utilities";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import {
  BattleSpoilsDetails,
  BattleFullReportData,
} from "@/domain/reports/combat-report.schema";
import { GameStateMetricsUtility } from "@geopolitics/domain";

export class BattleLogFactory {
  public static assembleReportData(
    attacker: Nation,
    defender: Nation,
    calcResult: BattleCalculationResult,
    targetProvince: ProvinceDynamicState | null | undefined,
    attackType: "LAND" | "NAVAL",
    isFullCapitulation: boolean,
    spoilsData?: BattleSpoilsDetails,
  ): BattleFullReportData {
    return {
      attackerId: attacker.id,
      defenderId: defender.id,
      targetProvinceId: targetProvince?.provinceId,
      attackType,
      isAttackerVictory: calcResult.isAttackerVictory,
      isFullCapitulation,
      valuationRatio: calcResult.valuationRatio,
      treasuryLooted: calcResult.treasuryLooted,
      attackerCasualties: calcResult.attackerCasualties,
      defenderCasualties: calcResult.defenderCasualties,
      phase1Missile: calcResult.phase1Missile,
      phase2Air: calcResult.phase2Air,
      phase3Ground: calcResult.phase3Ground,
      spoils: spoilsData,
      auxiliaryGuarantor: calcResult.auxiliaryGuarantor,
    };
  }

  public static createBattleLogs(
    currentTurn: number,
    attacker: Nation,
    defender: Nation,
    calcResult: BattleCalculationResult,
    betrayalPenaltyText: string,
    humanNationId: string,
    isDefenderAnnexed = false,
    targetProvince?: ProvinceDynamicState | null,
    attackType: "LAND" | "NAVAL" = "LAND",
    spoilsData?: BattleSpoilsDetails,
  ): TurnLogEntry[] {
    const logs: TurnLogEntry[] = [];
    const isAttackerHuman = GameStateMetricsUtility.isHumanNation(
      humanNationId,
      attacker.id,
    );
    const isDefenderHuman = GameStateMetricsUtility.isHumanNation(
      humanNationId,
      defender.id,
    );
    const isHumanInvolved = isAttackerHuman || isDefenderHuman;

    let outcome = "DEFEAT";

    if (isAttackerHuman) {
      if (isDefenderAnnexed) {
        outcome = "CAPITULATION";
      } else if (calcResult.isAttackerVictory) {
        outcome = "VICTORY";
      } else {
        outcome = "DEFEAT";
      }
    } else if (isDefenderHuman) {
      if (isDefenderAnnexed) {
        outcome = "CAPITULATION";
      } else if (!calcResult.isAttackerVictory) {
        outcome = "DEFENDED";
      } else {
        outcome = "DEFEAT";
      }
    }

    const fullReportData = this.assembleReportData(
      attacker,
      defender,
      calcResult,
      targetProvince,
      attackType,
      isDefenderAnnexed,
      spoilsData,
    );

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
            ratio: calcResult.valuationRatio,
            betrayalPenalty: betrayalPenaltyText
              ? Number(betrayalPenaltyText)
              : 0,
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

    if (isDefenderAnnexed && calcResult.isAttackerVictory) {
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
}
