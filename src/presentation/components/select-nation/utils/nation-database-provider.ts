import { ALL_COUNTRY_PROFILES, CountryProfile } from "@/domain/map/countries";
import { NationDetail } from "../nation-list-item";

export class NationDatabaseProvider {
  public getAllSelectableNations(): NationDetail[] {
    const sorted = [...ALL_COUNTRY_PROFILES].sort((a, b) => b.gdp - a.gdp);

    return sorted.map((profile: CountryProfile, index: number) => {
      const gdpBillion = (profile.gdp / 1e9).toFixed(1);
      const popMillion = (profile.population / 1e6).toFixed(1);

      let power = "قدرت منطقه‌ای";
      if (profile.gdp >= 10e12) power = "ابرقدرت جهانی";
      else if (profile.gdp >= 1e12) power = "قدرت برتر صنعتی";
      else if (profile.gdp >= 200e9) power = "قدرت فرامنطقه‌ای";

      return {
        id: `NATION_${profile.id}`,
        name: profile.nameFa,
        code: profile.flagCode.toLowerCase(),
        rank: index + 1,
        power,
        gdp: `${gdpBillion} میلیارد دلار`,
        population: `${popMillion} میلیون نفر`,
        treasury: `$${profile.startingTreasury.toLocaleString("fa-IR")}`,
        desc: `شناسنامه استراتژیک ${profile.nameFa} با ساختار اقتصادی و دفاعی اختصاصی.`,
        defaultGovernment: profile.startingGovernment ?? "DEMOCRACY",
      };
    });
  }
}
