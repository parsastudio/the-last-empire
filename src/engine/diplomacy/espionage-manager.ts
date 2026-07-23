import type { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";

export class EspionageManager {
  public applyDecay(relation: RelationProfile): RelationProfile {
    return relation;
  }
}
