import {
  Nation,
  CountryRegistry,
  NationRelationResolver,
} from "@geopolitics/domain";

export interface DiplomaticGlowData {
  r: number;
  g: number;
  b: number;
  intensity: number;
}

export class DiplomaticColorModulator {
  public static resolveDiplomaticGlow(
    ownerId: string,
    humanNationId?: string,
    nationsMap?: Record<string, Nation>,
  ): DiplomaticGlowData {
    if (!humanNationId || !nationsMap) {
      return { r: 15, g: 23, b: 42, intensity: 0.0 };
    }

    const canonicalOwner = CountryRegistry.resolveCanonicalId(ownerId);
    const canonicalHuman = CountryRegistry.resolveCanonicalId(humanNationId);

    if (canonicalOwner === canonicalHuman) {
      return { r: 16, g: 185, b: 129, intensity: 1.0 };
    }

    const humanNation = nationsMap[canonicalHuman] || nationsMap[humanNationId];
    if (!humanNation) {
      return { r: 15, g: 23, b: 42, intensity: 0.0 };
    }

    const stance = NationRelationResolver.getStance(
      humanNation.relations,
      canonicalOwner,
    );

    const isGuaranteed =
      CountryRegistry.resolveCanonicalId(
        humanNation.securityGuarantorId || "",
      ) === canonicalOwner;

    if (stance === "WAR") {
      return { r: 244, g: 35, b: 65, intensity: 1.0 };
    }

    if (stance === "STRATEGIC_PARTNERSHIP") {
      return { r: 6, g: 182, b: 212, intensity: 0.95 };
    }

    if (stance === "NON_AGGRESSION_PACT") {
      return { r: 245, g: 158, b: 11, intensity: 0.85 };
    }

    if (isGuaranteed) {
      return { r: 99, g: 102, b: 241, intensity: 0.9 };
    }

    return { r: 15, g: 23, b: 42, intensity: 0.0 };
  }
}
