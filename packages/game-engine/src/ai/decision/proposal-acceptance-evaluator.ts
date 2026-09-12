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
              label: "COALITION_CONTAINMENT_OBLIGATION",
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
                label: "NON_AGGRESSION_PACT_REQUIRED",
                value: -100,
              },
            ],
          };
        }

        reasons.push({
          label: "ACTIVE_NON_AGGRESSION_PACT",
          value: 50,
        });
        reasons.push({
          label: "PARTNERSHIP_DIVIDEND_GAIN",
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
                label: validation.reasonCode || "GUARANTEE_CONDITIONS_NOT_MET",
                value: -100,
              },
            ],
          };
        }

        reasons.push({
          label: "GDP_RATIO_AND_REACH_VERIFIED",
          value: 60,
        });
        reasons.push({
          label: "GUARANTEE_RETAINER_FEE_RECEIVED",
          value: 40,
        });
        break;
      }

      case "NON_AGGRESSION_PACT": {
        reasons.push({ label: "BASE_STABILITY_DESIRE", value: -2 });

        const alignVal = Math.round(vector.alignment * 0.5);
        reasons.push({ label: "POLITICAL_ALIGNMENT", value: alignVal });

        const tensionVal = -Math.round(vector.tension * 0.5);
        reasons.push({ label: "GEOPOLITICAL_TENSION", value: tensionVal });
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
                label: "WAR_FIRST_TURN_COOLDOWN",
                value: -1000,
              },
            ],
          };
        }

        reasons.push({ label: "BASE_FRONTLINE_RESISTANCE", value: -50 });

        if (receiver.government.stability < 30) {
          const exhaustion = Math.round(
            (30 - receiver.government.stability) * 1.5,
          );
          reasons.push({
            label: "WAR_WEARINESS_LOW_STABILITY",
            value: exhaustion,
          });
        }

        if (vector.powerRatio > 1.8) {
          const powerDiff = Math.min(
            60,
            Math.round((vector.powerRatio - 1.0) * 35),
          );
          reasons.push({
            label: "ENEMY_FRONTLINE_SUPERIORITY",
            value: powerDiff,
          });
        } else if (vector.powerRatio < 0.9) {
          const advantagePenalty = -Math.min(
            50,
            Math.round((1.0 - vector.powerRatio) * 50),
          );
          reasons.push({
            label: "OUR_MILITARY_ADVANTAGE",
            value: advantagePenalty,
          });
        }

        if (vector.reasons.revanchismPenalty > 0) {
          const revVal = -Math.round(vector.reasons.revanchismPenalty * 1.0);
          reasons.push({
            label: "TERRITORIAL_REVANCHISM",
            value: revVal,
          });
        }

        const animosityVal =
          vector.alignment < 0 ? Math.round(vector.alignment * 0.35) : 0;
        if (animosityVal !== 0) {
          reasons.push({
            label: "POLITICAL_HOSTILITY",
            value: animosityVal,
          });
        }
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
