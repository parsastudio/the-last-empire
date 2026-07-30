import {
  findCountryProfileByCode,
  findCountryProfileById,
} from "@/infrastructure/data/countries";

export class NationIdResolver {
  public static resolveCanonicalId(codeOrId: string): string {
    if (!codeOrId) return "NATION_118";

    const clean = codeOrId.trim().toUpperCase();
    if (clean.startsWith("NATION_")) {
      return clean;
    }

    const numericId = parseInt(clean, 10);
    if (!isNaN(numericId)) {
      return `NATION_${numericId}`;
    }

    const profileByCode = findCountryProfileByCode(clean);
    if (profileByCode) {
      return `NATION_${profileByCode.id}`;
    }

    const profileById = findCountryProfileById(Number(clean));
    if (profileById) {
      return `NATION_${profileById.id}`;
    }

    return `NATION_${clean}`;
  }
}
