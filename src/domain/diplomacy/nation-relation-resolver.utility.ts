import { CountryRegistry } from "@/domain/data/countries";
import {
  RelationProfile,
  DiplomaticStance,
} from "@/domain/diplomacy/diplomacy.schema";

export class NationRelationResolver {
  public static getRelation(
    relationsMap: Record<string, RelationProfile> | undefined,
    targetNationId: string,
  ): RelationProfile | null {
    if (!relationsMap || !targetNationId) return null;
    const canonicalTargetId =
      CountryRegistry.resolveCanonicalId(targetNationId);
    return (
      relationsMap[targetNationId] || relationsMap[canonicalTargetId] || null
    );
  }

  public static getStance(
    relationsMap: Record<string, RelationProfile> | undefined,
    targetNationId: string,
  ): DiplomaticStance {
    const relation = this.getRelation(relationsMap, targetNationId);
    return relation ? relation.stance : "NORMAL_DIPLOMACY";
  }

  public static isWar(
    relationsMap: Record<string, RelationProfile> | undefined,
    targetNationId: string,
  ): boolean {
    return this.getStance(relationsMap, targetNationId) === "WAR";
  }

  public static isTradeEmbargoed(
    sourceNation: {
      globalReputation: number;
      relations?: Record<string, RelationProfile>;
    },
    targetNation: { id: string; globalReputation: number },
  ): boolean {
    const stance = this.getStance(sourceNation.relations, targetNation.id);
    if (stance === "WAR") {
      return true;
    }
    if (stance === "ALLIANCE" || stance === "NON_AGGRESSION_PACT") {
      return false;
    }
    return (
      sourceNation.globalReputation <= -30 ||
      targetNation.globalReputation <= -30
    );
  }
}
