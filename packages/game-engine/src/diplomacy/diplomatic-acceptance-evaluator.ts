import {
  Nation,
  Province,
  PendingDiplomaticProposal,
} from "@geopolitics/domain";
import { GeopoliticalVectorCalculator } from "@/engine/ai/geopolitical-vector-calculator";
import { UtilityDecisionEngine } from "@/engine/ai/utility-decision-engine";

export class DiplomaticAcceptanceEvaluator {
  public static evaluate(
    proposal: PendingDiplomaticProposal,
    receiver: Nation,
    sender: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    currentTurn?: number,
  ): boolean {
    const vector = GeopoliticalVectorCalculator.calculate(
      receiver,
      sender,
      allNations,
      provincesMap,
    );

    const evaluation = UtilityDecisionEngine.evaluateAcceptance(
      proposal.proposalType,
      receiver,
      sender,
      vector,
      null,
      provincesMap,
      currentTurn,
    );

    return evaluation.willAccept;
  }
}
