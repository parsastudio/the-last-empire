import { Nation, DiplomaticProposalType } from "@geopolitics/domain";
import { GeopoliticalVector } from "@/engine/ai/geopolitical-vector-calculator";

export interface DecisionReasonItem {
  label: string;
  value: number;
}

export interface AcceptanceEvaluation {
  willAccept: boolean;
  score: number;
  reasons: DecisionReasonItem[];
}

export class UtilityDecisionEngine {
  public static calculateWarUtility(
    source: Nation,
    _target: Nation,
    vector: GeopoliticalVector,
  ): number {
    if (source.military.infantry < 4 || source.government.stability < 35) {
      return -100;
    }
    if (!vector.isNeighbor && !vector.isNavalReachable) {
      return -100;
    }

    const tensionScore = vector.tension * 0.7;
    const powerAdvantageScore =
      vector.powerRatio < 0.8 ? (1.0 - vector.powerRatio) * 60 : -40;
    const alignmentDampener = vector.alignment * 0.5;
    const stabilityScore = ((source.government.stability - 50) / 50) * 20;

    return Math.round(
      tensionScore + powerAdvantageScore - alignmentDampener + stabilityScore,
    );
  }

  public static calculateAllianceUtility(
    source: Nation,
    _target: Nation,
    vector: GeopoliticalVector,
  ): number {
    if (source.globalReputation < -20) return -100;
    const alignmentScore = vector.alignment * 0.8;
    const tensionPenalty = vector.tension * 0.6;
    const commonEnemyBonus = vector.reasons.commonEnemyBonus;

    return Math.round(alignmentScore - tensionPenalty + commonEnemyBonus);
  }

  public static calculateNapUtility(
    source: Nation,
    _target: Nation,
    vector: GeopoliticalVector,
  ): number {
    const alignmentScore = vector.alignment * 0.4;
    const neighborBonus = vector.isNeighbor ? 20 : 0;
    const tensionPenalty = vector.tension * 0.3;

    return Math.round(alignmentScore + neighborBonus - tensionPenalty);
  }

  public static calculatePeaceUtility(
    source: Nation,
    _target: Nation,
    vector: GeopoliticalVector,
  ): number {
    const exhaustionScore = (100 - source.government.stability) * 0.8;
    const weaknessScore =
      vector.powerRatio > 1.4 ? (vector.powerRatio - 1.0) * 40 : 0;
    const tensionDampener = vector.tension * 0.3;

    return Math.round(exhaustionScore + weaknessScore - tensionDampener);
  }

  public static evaluateAcceptance(
    proposalType: DiplomaticProposalType,
    receiver: Nation,
    _sender: Nation,
    vector: GeopoliticalVector,
  ): AcceptanceEvaluation {
    const reasons: DecisionReasonItem[] = [];
    let baseScore = 0;

    switch (proposalType) {
      case "FULL_ALLIANCE": {
        baseScore = -25;
        reasons.push({ label: "پیش‌نیاز اعتماد بنیادین", value: -25 });

        const alignVal = Math.round(vector.alignment * 0.6);
        reasons.push({ label: "همسویی استراتژیک", value: alignVal });

        const tensionVal = -Math.round(vector.tension * 0.5);
        reasons.push({ label: "تنش و اصطکاک مرزی", value: tensionVal });

        if (vector.reasons.commonEnemyBonus > 0) {
          reasons.push({
            label: "وجود دشمن مشترک",
            value: vector.reasons.commonEnemyBonus,
          });
        }
        break;
      }

      case "NON_AGGRESSION_PACT": {
        baseScore = 5;
        reasons.push({ label: "تمایل پایه به ثبات", value: 5 });

        const alignVal = Math.round(vector.alignment * 0.4);
        reasons.push({ label: "همسویی سیاسی", value: alignVal });

        const tensionVal = -Math.round(vector.tension * 0.3);
        reasons.push({ label: "اصطکاک ژئوپلیتیک", value: tensionVal });

        if (vector.isNeighbor) {
          reasons.push({ label: "تثبیت امنیت مرز مشترک", value: 20 });
        }
        break;
      }

      case "PEACE_TREATY": {
        baseScore = -15;
        reasons.push({ label: "مقاومت اولیه در جبهه", value: -15 });

        const exhaustion = Math.round(
          (100 - receiver.government.stability) * 0.7,
        );
        reasons.push({ label: "خستگی جنگ و افت ثبات", value: exhaustion });

        if (vector.powerRatio < 0.75) {
          const powerDiff = Math.round((1.0 - vector.powerRatio) * 50);
          reasons.push({ label: "برتری نظامی طرف مقابل", value: powerDiff });
        }

        const animosityVal =
          vector.alignment < 0 ? Math.round(vector.alignment * 0.4) : 0;
        reasons.push({
          label: "بی‌اعتمادی و تخاصم سیاسی",
          value: animosityVal,
        });
        break;
      }

      case "SEND_FOREIGN_AID": {
        baseScore = 100;
        reasons.push({ label: "دریافت کمک مالی بدون تعهد", value: 100 });
        break;
      }

      case "DECLARE_WAR": {
        baseScore = -100;
        break;
      }
    }

    const totalScore = reasons.reduce(
      (sum, item) => sum + item.value,
      baseScore,
    );

    return {
      willAccept: totalScore >= 0,
      score: totalScore,
      reasons,
    };
  }
}
