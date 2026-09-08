import {
  Nation,
  Province,
  DiplomaticProposalType,
  GlobalCoalition,
  CountryRegistry,
  SecurityGuaranteeValidator,
  NationRelationResolver,
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
    currentTurn?: number,
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
      case "STRATEGIC_PARTNERSHIP": {
        const canonicalSender = CountryRegistry.resolveCanonicalId(sender.id);
        const rel = NationRelationResolver.getRelation(
          receiver.relations,
          canonicalSender,
        );

        if (!rel || rel.stance !== "NON_AGGRESSION_PACT") {
          return {
            willAccept: false,
            score: -100,
            reasons: [
              {
                label: "شرط برقراری پیمان عدم تخاصم پیشین احراز نشده است",
                value: -100,
              },
            ],
          };
        }

        reasons.push({
          label: "برقراری پیمان عدم تخاصم فعال",
          value: 50,
        });
        reasons.push({
          label: "دریافت ۳٪ حق ورودی نقدی و سود نوبتی ۰.۶٪ GDP",
          value: 50,
        });
        break;
      }

      case "SECURITY_GUARANTEE": {
        const validation = SecurityGuaranteeValidator.validate(
          sender,
          receiver,
          provincesMap,
          false,
        );

        if (!validation.isValid) {
          return {
            willAccept: false,
            score: -100,
            reasons: [
              {
                label: validation.reason || "عدم احراز شرایط پیمان دفاعی",
                value: -100,
              },
            ],
          };
        }

        reasons.push({
          label: "احراز نسبت GDP بین ۰.۷ تا ۵ برابر و دسترسی سرزمینی",
          value: 60,
        });
        reasons.push({
          label: "دریافت یک‌باره ۱٪ از کل GDP کشور به عنوان حق تعهد دفاعی",
          value: 40,
        });
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
        const canonicalSender = CountryRegistry.resolveCanonicalId(sender.id);
        const rel =
          receiver.relations[canonicalSender] || receiver.relations[sender.id];

        if (
          currentTurn !== undefined &&
          rel?.warDeclaredTurn !== undefined &&
          currentTurn <= rel.warDeclaredTurn
        ) {
          return {
            willAccept: false,
            score: -1000,
            reasons: [
              {
                label: "ممنوعیت توقف جنگ در نوبت اول آغاز مخاصمه",
                value: -1000,
              },
            ],
          };
        }

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
