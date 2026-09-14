import {
  Nation,
  ProvinceDynamicState,
  CountryRegistry,
  NationRelationResolver,
  NationGettersUtility,
} from "@geopolitics/domain";
import {
  DiplomaticStampItem,
  DiplomaticStampVariant,
} from "@/presentation/components/tactical-map/overlays/diplomatic-stamps/types/diplomatic-stamp.types";
import { MainlandClusterResolver } from "@/presentation/components/tactical-map/overlays/diplomatic-stamps/utils/mainland-cluster-resolver.utility";

export class DiplomaticStampBuilderUtility {
  private static calculateMinZoomScale(
    pixels: number,
    isHighPriority: boolean,
  ): number {
    if (isHighPriority) return 0.1;
    if (pixels >= 45000) return 0.18;
    if (pixels >= 18000) return 0.35;
    if (pixels >= 6000) return 0.5;
    if (pixels >= 2000) return 0.65;
    return 0.85;
  }

  public static buildStamps(
    humanNationId?: string,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, ProvinceDynamicState>,
  ): DiplomaticStampItem[] {
    if (!nationsMap || !provincesMap) return [];

    const canonicalHuman = humanNationId
      ? CountryRegistry.resolveCanonicalId(humanNationId)
      : null;
    const humanNation = canonicalHuman
      ? nationsMap[canonicalHuman] || nationsMap[humanNationId!]
      : null;

    const rankMap = NationGettersUtility.calculateRankMap(
      nationsMap,
      provincesMap,
    );
    const items: DiplomaticStampItem[] = [];
    const processed = new Set<string>();

    if (humanNation && humanNation.isAlive) {
      const geo = MainlandClusterResolver.resolveGeometry(
        humanNation.id,
        provincesMap,
      );
      if (geo) {
        processed.add(canonicalHuman!);
        processed.add(humanNation.id);
        const rank = rankMap.get(canonicalHuman!) ?? 1;
        items.push({
          id: `label-${humanNation.id}`,
          nationId: humanNation.id,
          nationName: humanNation.id,
          flagCode: humanNation.flagCode || humanNation.id,
          variant: "PLAYER",
          worldX: geo.centerX,
          worldY: geo.centerY,
          territoryPixels: geo.totalPixels,
          effectiveRadius: geo.effectiveDiameter / 2,
          minZoomScale: 0.1,
          rank,
          isSuperpower: rank <= 6,
        });
      }
    }

    for (const nation of Object.values(nationsMap)) {
      if (!nation.isAlive) continue;

      const canonicalTarget = CountryRegistry.resolveCanonicalId(nation.id);
      if (processed.has(canonicalTarget) || processed.has(nation.id)) {
        continue;
      }
      processed.add(canonicalTarget);
      processed.add(nation.id);

      const geo = MainlandClusterResolver.resolveGeometry(
        nation.id,
        provincesMap,
      );
      if (!geo) continue;

      const rank = rankMap.get(canonicalTarget) ?? 99;
      let variant: DiplomaticStampVariant = "NEUTRAL";

      if (humanNation && canonicalHuman) {
        const rel = NationRelationResolver.getRelation(
          humanNation.relations,
          canonicalTarget,
        );

        const umbrella = NationRelationResolver.resolveBilateralUmbrellaState(
          humanNation,
          nation,
        );

        if (rel?.stance === "WAR") {
          variant = "WAR";
        } else if (rel?.stance === "STRATEGIC_PARTNERSHIP") {
          variant = "STRATEGIC_PARTNERSHIP";
        } else if (rel?.stance === "NON_AGGRESSION_PACT") {
          variant = "NON_AGGRESSION_PACT";
        } else if (umbrella.hasSecurityGuarantee) {
          variant = "SECURITY_GUARANTEE";
        }
      }

      const isHighPriority =
        variant === "WAR" || variant === "STRATEGIC_PARTNERSHIP";

      const minZoomScale = this.calculateMinZoomScale(
        geo.totalPixels,
        isHighPriority,
      );

      items.push({
        id: `label-${nation.id}`,
        nationId: nation.id,
        nationName: nation.id,
        flagCode: nation.flagCode || nation.id,
        variant,
        worldX: geo.centerX,
        worldY: geo.centerY,
        territoryPixels: geo.totalPixels,
        effectiveRadius: geo.effectiveDiameter / 2,
        minZoomScale,
        rank,
        isSuperpower: rank <= 6,
      });
    }

    return items;
  }
}
