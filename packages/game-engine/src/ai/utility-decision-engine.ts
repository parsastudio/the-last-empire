import {
  Nation,
  Province,
  DiplomaticProposalType,
  GlobalCoalition,
  CountryRegistry,
  SecurityGuaranteeValidator,
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
    target: Nation,
    vector: GeopoliticalVector,
    targetGdp?: number,
    allNations?: Record<string, Nation>,
  ): number {
    if (vector.tension < 20) {
      return -100;
    }

    if (source.military.infantry < 2 || source.government.stability < 20) {
      return -100;
    }

    if (vector.proximityTier === "NONE") {
      return -100;
    }

    let rawPowerAdvantage = 0;
    if (vector.powerRatio > 1.0) {
      rawPowerAdvantage = -Math.round((vector.powerRatio - 1.0) * 60);
    } else {
      rawPowerAdvantage = Math.round((1.0 - vector.powerRatio) * 45);
    }

    let opportunismBonus = 0;
    if (target.relations) {
      const sourceCanonical = CountryRegistry.resolveCanonicalId(source.id);
      for (const [relId, rel] of Object.entries(target.relations)) {
        if (rel.stance === "WAR") {
          const cRel = CountryRegistry.resolveCanonicalId(relId);
          if (cRel !== sourceCanonical) {
            const other = allNations
              ? allNations[cRel] || allNations[relId]
              : null;
            if (!other || other.isAlive) {
              opportunismBonus += 25;
              break;
            }
          }
        }
      }
    }

    if (target.government.stability < 35) {
      opportunismBonus += 20;
    }

    const tGdp = targetGdp ?? 50_000_000_000;
    if (target.treasury <= 0 || target.nationalDebt >= tGdp * 0.4) {
      opportunismBonus += 15;
    }

    let proximityMultiplier = 1.0;
    let distancePenalty = 0;

    switch (vector.proximityTier) {
      case "DIRECT_NEIGHBOR":
        proximityMultiplier = 1.0;
        distancePenalty = 0;
        break;
      case "REGIONAL_MARITIME":
        proximityMultiplier = 0.7;
        distancePenalty = -10;
        break;
      case "DISTANT_OCEAN":
        proximityMultiplier = 0.3;
        distancePenalty = -30;
        break;
      default:
        return -100;
    }

    const powerAdvantageScore =
      rawPowerAdvantage > 0
        ? Math.round(rawPowerAdvantage * proximityMultiplier)
        : rawPowerAdvantage;

    const tensionScore = Math.round(vector.tension * 0.5);
    const alignmentDampener = Math.round(vector.alignment * 0.4);
    const stabilityScore = Math.round(
      ((source.government.stability - 50) / 50) * 15,
    );

    return Math.round(
      tensionScore +
        powerAdvantageScore +
        opportunismBonus +
        distancePenalty -
        alignmentDampener +
        stabilityScore,
    );
  }

  public static calculateStrategicPartnershipUtility(
    source: Nation,
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

  public static calculateNapUtility(vector: GeopoliticalVector): number {
    const alignmentScore = vector.alignment * 0.6;
    const tensionPenalty = vector.tension * 0.5;

    return Math.round(alignmentScore - tensionPenalty);
  }

  public static calculatePeaceUtility(
    source: Nation,
    vector: GeopoliticalVector,
  ): number {
    const exhaustionScore =
      source.government.stability < 30
        ? (30 - source.government.stability) * 1.5
        : -45;

    const weaknessScore =
      vector.powerRatio > 1.8 ? (vector.powerRatio - 1.0) * 35 : -45;

    const reachBonus = !vector.isNeighbor && !vector.isNavalReachable ? 40 : 0;
    const tensionDampener = vector.tension * 0.4;
    const revanchismDampener = vector.reasons.revanchismPenalty * 0.8;

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
    provincesMap?: Record<string, Province>,
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
        const validation = SecurityGuaranteeValidator.validate(
          sender,
          receiver,
          provincesMap,
        );

        if (!validation.isValid) {
          return {
            willAccept: false,
            score: -100,
            reasons: [
              {
                label: validation.reason || "عدم احراز شروط سه‌گانه امنیتی",
                value: -100,
              },
            ],
          };
        }

        reasons.push({
          label: "احراز کامل نسبت GDP و برتری فناوری",
          value: 50,
        });
        reasons.push({ label: "دریافت نوبتی ۱۰٪ درآمد پایدار", value: 50 });
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
        reasons.push({ label: "تمایل پایه به ثبات", value: -2 });

        const alignVal = Math.round(vector.alignment * 0.5);
        reasons.push({ label: "همسویی سیاسی", value: alignVal });

        const tensionVal = -Math.round(vector.tension * 0.5);
        reasons.push({ label: "اصطکاک ژئوپلیتیک", value: tensionVal });
        break;
      }

      case "PEACE_TREATY": {
        reasons.push({ label: "مقاومت اولیه در جبهه نبرد", value: -50 });

        if (receiver.government.stability < 30) {
          const exhaustion = Math.round(
            (30 - receiver.government.stability) * 1.5,
          );
          reasons.push({
            label: "خستگی جنگ و افت شدید ثبات",
            value: exhaustion,
          });
        }

        if (vector.powerRatio > 1.8) {
          const powerDiff = Math.min(
            60,
            Math.round((vector.powerRatio - 1.0) * 35),
          );
          reasons.push({
            label: "برتری نظامی طرف مقابل در جبهه",
            value: powerDiff,
          });
        } else if (vector.powerRatio < 0.9) {
          const advantagePenalty = -Math.min(
            50,
            Math.round((1.0 - vector.powerRatio) * 50),
          );
          reasons.push({
            label: "برتری نظامی ارتش ما و تداوم تهاجم",
            value: advantagePenalty,
          });
        }

        if (vector.reasons.revanchismPenalty > 0) {
          const revVal = -Math.round(vector.reasons.revanchismPenalty * 1.0);
          reasons.push({
            label: "اشغال خاک مادری و ادعای سرزمینی",
            value: revVal,
          });
        }

        const animosityVal =
          vector.alignment < 0 ? Math.round(vector.alignment * 0.35) : 0;
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
