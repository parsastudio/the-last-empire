import {
  CombatReport,
  ReportSeverity,
  CasualtyMetrics,
} from "@/domain/reports/combat-report.schema";
import { BattleNarrativeGenerator } from "./battle-narrative-generator";

export interface RawBattleData {
  attackerId: string;
  attackerNameFa: string;
  defenderId: string;
  defenderNameFa: string;
  turn: number;
  attackerCasualties: CasualtyMetrics;
  defenderCasualties: CasualtyMetrics;
  conqueredPixelsCount: number;
  capitulatedPixelsCount: number;
  governmentType?: string;
}

export class CombatReportEngine {
  private narrativeGenerator = new BattleNarrativeGenerator();
  private readonly sqKmPerPixel = 86.3;

  public createReport(data: RawBattleData): CombatReport {
    const totalPixels = data.conqueredPixelsCount + data.capitulatedPixelsCount;
    const conqueredAreaSqKm = Math.round(totalPixels * this.sqKmPerPixel);

    const totalAttackerLoss =
      data.attackerCasualties.infantryLost +
      data.attackerCasualties.airForceLost * 3 +
      data.attackerCasualties.droneMissileLost * 2;

    const totalDefenderLoss =
      data.defenderCasualties.infantryLost +
      data.defenderCasualties.airForceLost * 3 +
      data.defenderCasualties.droneMissileLost * 2;

    const isVictory = totalPixels > 0;
    let severity: ReportSeverity = "INFO";

    if (isVictory) {
      if (totalAttackerLoss > totalDefenderLoss * 1.5) {
        severity = "PYRRHIC_VICTORY";
      } else if (totalDefenderLoss > totalAttackerLoss * 2) {
        severity = "CRUSHING_VICTORY";
      } else {
        severity = "VICTORY";
      }
    } else {
      if (totalAttackerLoss > 100) {
        severity = "CRITICAL_DEFEAT";
      } else {
        severity = "DEFEAT";
      }
    }

    const narrative = this.narrativeGenerator.generateBattleNarrative({
      attackerNameFa: data.attackerNameFa,
      defenderNameFa: data.defenderNameFa,
      isVictory,
      severity,
      attackerCasualties: data.attackerCasualties,
      defenderCasualties: data.defenderCasualties,
      conqueredAreaSqKm,
      governmentType: data.governmentType,
    });

    return {
      id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      turn: data.turn,
      timestamp: Date.now(),
      severity,
      title: narrative.title,
      summary: narrative.summary,
      attackerNationId: data.attackerId,
      attackerName: data.attackerNameFa,
      defenderNationId: data.defenderId,
      defenderName: data.defenderNameFa,
      attackerCasualties: data.attackerCasualties,
      defenderCasualties: data.defenderCasualties,
      conqueredAreaSqKm,
      capitulatedAreaSqKm: Math.round(
        data.capitulatedPixelsCount * this.sqKmPerPixel,
      ),
      strategicAssessment: narrative.strategicAssessment,
      isVictory,
    };
  }
}
