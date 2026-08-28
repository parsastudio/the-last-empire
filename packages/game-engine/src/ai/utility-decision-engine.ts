import {
  Nation,
  DiplomaticProposalType,
  GlobalCoalition,
  CountryRegistry,
} from "@geopolitics/domain";
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
    if (vector.proximityTier === "NONE") {
      return -100;
    }

    const tensionScore = vector.tension * 0.7;
    const rawPowerAdvantage =
      vector.powerRatio < 0.8 ? (1.0 - vector.powerRatio) * 50 : -40;

    let opportunismMultiplier = 0.0;
    let distancePenalty = 0;

    switch (vector.proximityTier) {
      case "DIRECT_NEIGHBOR":
        opportunismMultiplier = 1.0;
        distancePenalty = 0;
        break;
      case "REGIONAL_MARITIME":
        opportunismMultiplier = 0.35;
        distancePenalty = -20;
        break;
      case "DISTANT_OCEAN":
        opportunismMultiplier = 0.0;
        distancePenalty = -50;
        break;
      default:
        return -100;
    }

    const powerAdvantageScore =
      rawPowerAdvantage > 0
        ? Math.round(rawPowerAdvantage * opportunismMultiplier)
        : rawPowerAdvantage;

    let tierStrategyModifier = 0;
    const isSourceSuperpower = vector.sourceReachTier === "SUPERPOWER";
    const isTargetSuperpower = vector.targetReachTier === "SUPERPOWER";
    const isTargetLocal = vector.targetReachTier === "LOCAL_POWER";

    if (isSourceSuperpower && isTargetSuperpower) {
      tierStrategyModifier = vector.alignment < 10 ? 30 : 15;
    } else if (
      isSourceSuperpower &&
      isTargetLocal &&
      vector.proximityTier !== "DIRECT_NEIGHBOR"
    ) {
      tierStrategyModifier = -35;
    } else if (
      vector.sourceReachTier === "LOCAL_POWER" &&
      vector.proximityTier !== "DIRECT_NEIGHBOR"
    ) {
      tierStrategyModifier = -30;
    }

    const regimeWarModifier = 0;
    const alignmentDampener = vector.alignment * 0.5;
    const stabilityScore = ((source.government.stability - 50) / 50) * 20;

    return Math.round(
      tensionScore +
        powerAdvantageScore +
        distancePenalty +
        tierStrategyModifier +
        regimeWarModifier -
        alignmentDampener +
        stabilityScore,
    );
  }

  public static calculateStrategicPartnershipUtility(
    source: Nation,
    _target: Nation,
    vector: GeopoliticalVector,
  ): number {
    if (source.globalReputation < -20 || vector.lostProvincesCount > 0) {
      return -100;
    }
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
    const exhaustionScore =
      source.government.stability < 55
        ? (55 - source.government.stability) * 1.2
        : -25;

    const weaknessScore =
      vector.powerRatio > 1.25 ? (vector.powerRatio - 1.0) * 45 : -35;

    const reachBonus = !vector.isNeighbor && !vector.isNavalReachable ? 60 : 0;
    const tensionDampener = vector.tension * 0.3;
    const revanchismDampener = vector.reasons.revanchismPenalty * 0.5;

    return Math.round(
      exhaustionScore +
        weaknessScore +
        reachBonus -
        tensionDampener -
        revanchismDampener,
    );
  }

  public static evaluateAcceptance(
    proposalType: DiplomaticProposalType,
    receiver: Nation,
    sender: Nation,
    vector: GeopoliticalVector,
    globalCoalition?: GlobalCoalition | null,
  ): AcceptanceEvaluation {
    const reasons: DecisionReasonItem[] = [];

    if (globalCoalition && proposalType === "PEACE_TREATY") {
      const rCanonical = CountryRegistry.resolveCanonicalId(receiver.id);
      const sCanonical = CountryRegistry.resolveCanonicalId(sender.id);
      const isMemberAndTarget =
        (globalCoalition.memberNationIds.includes(rCanonical) &&
          sCanonical === globalCoalition.targetNationId) ||
        (globalCoalition.memberNationIds.includes(sCanonical) &&
          rCanonical === globalCoalition.targetNationId);

      if (isMemberAndTarget) {
        return {
          willAccept: false,
          score: -1000,
          reasons: [
            {
              label: "تعهد به پیمان دفاع جمعی ائتلاف مهار هژمونی",
              value: -1000,
            },
          ],
        };
      }
    }

    switch (proposalType) {
      case "SECURITY_GUARANTEE": {
        if (vector.tension >= 40) {
          return {
            willAccept: false,
            score: -50,
            reasons: [{ label: "تنش امنیتی بالا با کشور متقاضی", value: -50 }],
          };
        }
        reasons.push({ label: "دریافت نوبتی ۱۰٪ درآمد پایدار", value: 60 });
        reasons.push({ label: "تنش امنیتی پایین", value: 20 });
        break;
      }

      case "STRATEGIC_PARTNERSHIP": {
        reasons.push({ label: "پیش‌نیاز اعتماد بنیادین", value: -20 });

        const alignVal = Math.round(vector.alignment * 0.6);
        reasons.push({ label: "همسویی استراتژیک", value: alignVal });

        const tensionVal = -Math.round(vector.tension * 0.5);
        reasons.push({ label: "تنش و اصطکاک مرزی", value: tensionVal });

        if (vector.lostProvincesCount > 0) {
          reasons.push({
            label: "اشغال خاک مادری توسط طرف مقابل",
            value: -50,
          });
        }

        if (vector.reasons.commonEnemyBonus > 0) {
          reasons.push({
            label: "وجود دشمن مشترک",
            value: vector.reasons.commonEnemyBonus,
          });
        }
        break;
      }

      case "NON_AGGRESSION_PACT": {
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
        reasons.push({ label: "مقاومت اولیه در جبهه نبرد", value: -25 });

        if (receiver.government.stability < 55) {
          const exhaustion = Math.round(
            (55 - receiver.government.stability) * 1.2,
          );
          reasons.push({
            label: "خستگی جنگ و افت شدید ثبات",
            value: exhaustion,
          });
        }

        if (vector.powerRatio > 1.25) {
          const powerDiff = Math.min(
            50,
            Math.round((vector.powerRatio - 1.0) * 40),
          );
          reasons.push({
            label: "برتری نظامی طرف مقابل در جبهه",
            value: powerDiff,
          });
        } else if (vector.powerRatio < 0.8) {
          const advantagePenalty = -Math.min(
            45,
            Math.round((1.0 - vector.powerRatio) * 45),
          );
          reasons.push({
            label: "برتری نظامی ارتش ما و تداوم تهاجم",
            value: advantagePenalty,
          });
        }

        if (vector.reasons.revanchismPenalty > 0) {
          const revVal = -Math.round(vector.reasons.revanchismPenalty * 0.8);
          reasons.push({
            label: "اشغال خاک مادری و ادعای سرزمینی",
            value: revVal,
          });
        }

        const animosityVal =
          vector.alignment < 0 ? Math.round(vector.alignment * 0.25) : 0;
        if (animosityVal !== 0) {
          reasons.push({
            label: "بی‌اعتمادی و تخاصم سیاسی",
            value: animosityVal,
          });
        }
        break;
      }

      case "CANCEL_SECURITY_GUARANTEE":
      case "SEND_FOREIGN_AID": {
        reasons.push({ label: "پذیرش تعهد بدون قید و شرط", value: 100 });
        break;
      }

      case "DECLARE_WAR": {
        reasons.push({ label: "اعلان جنگ رسمی", value: -100 });
        break;
      }
    }

    const totalScore = reasons.reduce((sum, item) => sum + item.value, 0);

    return {
      willAccept: totalScore >= 0,
      score: totalScore,
      reasons,
    };
  }
}
