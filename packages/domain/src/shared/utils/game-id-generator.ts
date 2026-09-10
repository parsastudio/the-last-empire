import { CountryRegistry } from "@/domain/data/countries";

export class GameIdGenerator {
  public static generateId(prefix: string): string {
    const randomSlug = Math.random().toString(36).substring(2, 7);
    return `${prefix}-${Date.now()}-${randomSlug}`;
  }

  public static generateCampaignId(countryCode = "IRN"): string {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }
    const cleanCountry = CountryRegistry.resolveCanonicalId(countryCode);
    return `${cleanCountry}-${code}`;
  }
}
