import { Nation } from "@/domain/nation/nation.schema";
import {
  RelationProfile,
  DiplomaticProposalType,
} from "@/domain/diplomacy/diplomacy.schema";
import {
  TreatyProposalEvaluator,
  ProposalEvaluation,
} from "./treaty/treaty-proposal.evaluator";
import { TreatyStanceApplier } from "./treaty/treaty-stance.applier";

export class TreatyEvaluator {
  private proposalEvaluator = new TreatyProposalEvaluator();
  private stanceApplier = new TreatyStanceApplier();

  public evaluateProposal(
    sender: Nation,
    receiver: Nation,
    proposalType: DiplomaticProposalType,
    requestedTributeAmount?: number,
  ): ProposalEvaluation {
    return this.proposalEvaluator.evaluateProposal(
      sender,
      receiver,
      proposalType,
      requestedTributeAmount,
    );
  }

  public applyTreatyStance(
    profile: RelationProfile,
    newType: DiplomaticProposalType,
  ): RelationProfile {
    return this.stanceApplier.applyTreatyStance(profile, newType);
  }
}
