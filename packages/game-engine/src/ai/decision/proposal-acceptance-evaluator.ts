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

export class ProposalAcceptanceEvaluator {
  public static evaluate(
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
        reasons.push({ label: "دریافت نوبتی ۲٪ درآمد پایدار", value: 50 });
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
