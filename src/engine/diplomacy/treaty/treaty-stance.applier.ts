import {
  RelationProfile,
  DiplomaticProposalType,
} from "@/domain/diplomacy/diplomacy.schema";

export class TreatyStanceApplier {
  public applyTreatyStance(
    profile: RelationProfile,
    newType: DiplomaticProposalType,
  ): RelationProfile {
    switch (newType) {
      case "NON_AGGRESSION_PACT":
        return {
          ...profile,
          stance: "NON_AGGRESSION_PACT",
          coolOffTurnsRemaining: 0,
        };
      case "FULL_ALLIANCE":
        return {
          ...profile,
          stance: "ALLIANCE",
          coolOffTurnsRemaining: 0,
        };
      case "PEACE_TREATY":
        return {
          ...profile,
          stance: "PEACE",
          coolOffTurnsRemaining: 10,
        };
      default:
        return profile;
    }
  }
}
