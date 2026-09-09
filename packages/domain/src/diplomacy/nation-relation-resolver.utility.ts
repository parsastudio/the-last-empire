import { CountryRegistry } from "@/domain/data/countries";
import { Nation } from "@/domain/nation/nation.schema";
import {
  RelationProfile,
  DiplomaticStance,
} from "@/domain/diplomacy/diplomacy.schema";
import { DIPLOMACY_CONFIG } from "@/domain/diplomacy/diplomacy.config";
import { TerritoryClaimsUtility } from "@/domain/nation/territory-claims.utility";

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

  public static getBilateralRelation(
    nationA: { relations?: Record<string, RelationProfile> },
    nationB: { id: string; relations?: Record<string, RelationProfile> },
  ): RelationProfile | null {
    const relFromA = this.getRelation(nationA.relations, nationB.id);
    if (relFromA) return relFromA;

    if ("id" in nationA && typeof nationA.id === "string") {
      return this.getRelation(nationB.relations, nationA.id);
    }

    return null;
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

  public static getActiveWarEnemies(
    nation: Nation,
    allNations?: Record<string, Nation>,
  ): Nation[] {
    if (!nation.relations) return [];
    const enemies: Nation[] = [];
    const sourceCanonical = CountryRegistry.resolveCanonicalId(nation.id);

    for (const [targetId, rel] of Object.entries(nation.relations)) {
      if (rel.stance === "WAR") {
        const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);
        if (canonicalTarget !== sourceCanonical) {
          const enemy = allNations
            ? allNations[canonicalTarget] || allNations[targetId]
            : null;
          if (enemy && enemy.isAlive) {
            enemies.push(enemy);
          }
        }
      }
    }

    return enemies;
  }

  public static countActiveWars(
    nation: Nation,
    allNations?: Record<string, Nation>,
  ): number {
    if (!nation.relations) return 0;
    if (!allNations) {
      return Object.values(nation.relations).filter((r) => r.stance === "WAR")
        .length;
    }
    return this.getActiveWarEnemies(nation, allNations).length;
  }

  public static isAtWar(
    nation: Nation,
    allNations?: Record<string, Nation>,
  ): boolean {
    if (!nation.relations) return false;
    if (!allNations) {
      return Object.values(nation.relations).some((r) => r.stance === "WAR");
    }
    return this.countActiveWars(nation, allNations) > 0;
  }

  public static hasCommonEnemy(
    nationA: Nation,
    nationB: Nation,
    allNations: Record<string, Nation>,
  ): boolean {
    const relsA = nationA.relations;
    const relsB = nationB.relations;
    if (!relsA || !relsB) return false;

    for (const key in relsA) {
      if (relsA[key]?.stance === "WAR") {
        const targetB = relsB[key];
        if (targetB?.stance === "WAR") {
          const enemy = allNations[key];
          if (enemy && enemy.isAlive) {
            return true;
          }
        }
      }
    }
    return false;
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
    if (
      stance === "STRATEGIC_PARTNERSHIP" ||
      stance === "NON_AGGRESSION_PACT"
    ) {
      return false;
    }
    return (
      sourceNation.globalReputation <= -30 ||
      targetNation.globalReputation <= -30
    );
  }

  public static calculatePostWarCooldown(
    nation: {
      isAi: boolean;
      relations?: Record<string, RelationProfile>;
      postWarCooldownTurns?: number;
    },
    hasConcludedWar: boolean,
    allNations?: Record<string, Nation>,
  ): number {
    if (!nation.isAi) {
      return 0;
    }
    if (!hasConcludedWar) {
      return nation.postWarCooldownTurns || 0;
    }
    const hasRemainingActiveWars = nation.relations
      ? Object.values(nation.relations).some((r) => r.stance === "WAR")
      : false;

    return hasRemainingActiveWars
      ? 0
      : DIPLOMACY_CONFIG.POST_WAR_COOLDOWN_TURNS;
  }
}

export class DiplomacyLockManager {
  public static createKey(idA: string, idB: string): string {
    return TerritoryClaimsUtility.createPairKey(idA, idB);
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
