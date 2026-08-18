import { CountryRegistry } from "@/domain/data/countries";
import { Nation } from "@/domain/nation/nation.schema";
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
      relationsMap[canonicalTargetId] || relationsMap[targetNationId] || null
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

  public static hasCommonEnemy(
    nationA: Nation,
    nationB: Nation,
    allNations: Record<string, Nation>,
  ): boolean {
    return Object.values(allNations).some((third) => {
      if (
        !third.isAlive ||
        third.id === nationA.id ||
        third.id === nationB.id
      ) {
        return false;
      }
      const warA = this.isWar(nationA.relations, third.id);
      const warB = this.isWar(nationB.relations, third.id);
      return warA && warB;
    });
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

export class DiplomacyLockManager {
  public static createKey(idA: string, idB: string): string {
    const cA = CountryRegistry.resolveCanonicalId(idA);
    const cB = CountryRegistry.resolveCanonicalId(idB);
    return `${cA}:${cB}`;
  }

  public static isLocked(
    lockedSet: Set<string> | undefined,
    idA: string,
    idB: string,
  ): boolean {
    if (!lockedSet) return false;
    const key1 = this.createKey(idA, idB);
    const key2 = this.createKey(idB, idA);
    return lockedSet.has(key1) || lockedSet.has(key2);
  }
}
