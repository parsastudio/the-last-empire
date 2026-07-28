import {
  findCountryProfileByCode,
  findCountryProfileById,
} from "@/domain/map/countries";

export class NationIdResolver {
  public resolveFullNationId(codeOrId: string): string {
    if (codeOrId.startsWith("NATION_")) {
      return codeOrId;
    }

    const numericId = parseInt(codeOrId, 10);
    if (!isNaN(numericId)) {
      return `NATION_${numericId}`;
    }

    const profileByCode = findCountryProfileByCode(codeOrId);
    if (profileByCode) {
      return `NATION_${profileByCode.id}`;
    }

    const profileById = findCountryProfileById(Number(codeOrId));
    if (profileById) {
      return `NATION_${profileById.id}`;
    }

    return codeOrId;
  }
}
