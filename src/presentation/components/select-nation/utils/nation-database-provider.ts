import { ALL_COUNTRY_PROFILES, CountryProfile } from "@/domain/map/countries";
import { NationDetail } from "../nation-list-item";

export class NationDatabaseProvider {
  public getAllSelectableNations(): NationDetail[] {
    const sorted = [...ALL_COUNTRY_PROFILES].sort((a, b) => b.gdp - a.gdp);

    return sorted.map((profile: CountryProfile, index: number) => {
      let gdpText = "";
      if (profile.gdp >= 1e12) {
        gdpText = `${(profile.gdp / 1e12).toFixed(1)} تریلیون دلار`;
      } else {
        gdpText = `${(profile.gdp / 1e9).toFixed(1)} میلیارد دلار`;
      }

      let popText = "";
      if (profile.population >= 1e9) {
        popText = `${(profile.population / 1e9).toFixed(2)} میلیارد نفر`;
      } else {
        popText = `${(profile.population / 1e6).toFixed(1)} میلیون نفر`;
      }

      let power = "قدرت منطقه‌ای";
      if (profile.gdp >= 10e12) power = "ابرقدرت جهانی";
      else if (profile.gdp >= 1e12) power = "قدرت برتر صنعتی";
      else if (profile.gdp >= 200e9) power = "قدرت فرامنطقه‌ای";

      return {
        id: `NATION_${profile.id}`,
        name: profile.nameFa,
        code: profile.flagCode.toUpperCase(),
        rank: index + 1,
        power,
        gdp: gdpText,
        population: popText,
        treasury: `$${profile.startingTreasury.toLocaleString("fa-IR")}`,
        desc: `شناسنامه استراتژیک رسمی ${profile.nameFa} با ساختار اقتصادی به ارزش ${gdpText} و جمعیت ${popText}.`,
        defaultGovernment: profile.startingGovernment ?? "DEMOCRACY",
      };
    });
  }
}
