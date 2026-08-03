import {
  findCountryProfileByCode,
  findCountryProfileById,
} from "@/domain/data/countries";

export class NationIdResolver {
  public static resolveCanonicalId(codeOrId: string): string {
    if (!codeOrId) return "";

    const clean = codeOrId.trim().toUpperCase();

    let profile = findCountryProfileByCode(clean);
    if (!profile) {
      const rawNum = clean.replace("NATION_", "");
      const numericId = parseInt(rawNum, 10);
      if (!isNaN(numericId)) {
        profile = findCountryProfileById(numericId);
      }
    }

    if (profile) {
      return `NATION_${profile.code.toUpperCase()}`;
    }

    if (clean.startsWith("NATION_")) {
      return clean;
    }

    return `NATION_${clean}`;
  }
}
