import {
  Nation,
  Province,
  DiplomaticProposalType,
  GlobalCoalition,
} from "@geopolitics/domain";
import { GeopoliticalVector } from "@/engine/ai/geopolitical-vector-calculator";
import { WarUtilityEvaluator } from "@/engine/ai/decision/war-utility-evaluator";
import { TreatyUtilityEvaluator } from "@/engine/ai/decision/treaty-utility-evaluator";
import {
  ProposalAcceptanceEvaluator,
  DecisionReasonItem,
  AcceptanceEvaluation,
} from "@/engine/ai/decision/proposal-acceptance-evaluator";

export type { DecisionReasonItem, AcceptanceEvaluation };

export class UtilityDecisionEngine {
  public static calculateWarUtility(
    source: Nation,
    target: Nation,
    vector: GeopoliticalVector,
    targetGdp?: number,
    allNations?: Record<string, Nation>,
  ): number {
    return WarUtilityEvaluator.calculate(
      source,
      target,
      vector,
      targetGdp,
      allNations,
    );
  }

  public static calculateStrategicPartnershipUtility(
    source: Nation,
    vector: GeopoliticalVector,
  ): number {
    return TreatyUtilityEvaluator.calculateStrategicPartnershipUtility(
      source,
      vector,
    );
  }

  public static calculateNapUtility(vector: GeopoliticalVector): number {
    return TreatyUtilityEvaluator.calculateNapUtility(vector);
  }

  public static evaluateAcceptance(
    proposalType: DiplomaticProposalType,
    receiver: Nation,
    sender: Nation,
    vector: GeopoliticalVector,
    globalCoalition?: GlobalCoalition | null,
    provincesMap?: Record<string, Province>,
  ): AcceptanceEvaluation {
    return ProposalAcceptanceEvaluator.evaluate(
      proposalType,
      receiver,
      sender,
      vector,
      globalCoalition,
      provincesMap,
    );
  }
}
