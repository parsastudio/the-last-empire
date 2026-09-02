import { PendingDiplomaticProposal } from "@/domain/diplomacy/diplomacy.schema";
import { CountryRegistry } from "@/domain/data/countries";

export class PendingProposalManagerUtility {
  public static removeById(
    proposals: PendingDiplomaticProposal[],
    proposalId: string,
  ): PendingDiplomaticProposal[] {
    return proposals.filter((p) => p.id !== proposalId);
  }

  public static removeBilateral(
    proposals: PendingDiplomaticProposal[],
    nationIdA: string,
    nationIdB: string,
  ): PendingDiplomaticProposal[] {
    const canonicalA = CountryRegistry.resolveCanonicalId(nationIdA);
    const canonicalB = CountryRegistry.resolveCanonicalId(nationIdB);
    return proposals.filter((p) => {
      const src = CountryRegistry.resolveCanonicalId(p.senderNationId);
      const rec = CountryRegistry.resolveCanonicalId(p.receiverNationId);
      const isMatch =
        (src === canonicalA && rec === canonicalB) ||
        (src === canonicalB && rec === canonicalA);
      return !isMatch;
    });
  }

  public static filterValidTurn(
    proposals: PendingDiplomaticProposal[],
    currentTurn: number,
  ): PendingDiplomaticProposal[] {
    return proposals.filter((p) => currentTurn <= p.expiresTurn);
  }
}
