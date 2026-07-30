import {
  ALL_COUNTRY_PROFILES,
  CountryProfile,
} from "@/infrastructure/data/countries";
import { NationDetail } from "../nation-list-item";
import { ManifestNationItem } from "@/infrastructure/map-preprocessing/generator/map-manifest-builder";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export class NationDatabaseProvider {
  public getNationsFromManifest(
    manifestNations: ManifestNationItem[],
  ): NationDetail[] {
    return manifestNations.map((item) => {
      const computedTreasury = Math.floor(item.gdp * 0.05);

      let gdpText = "";
      if (item.gdp >= 1e12) {
        gdpText = `${(item.gdp / 1e12).toFixed(1)} تریلیارد دلار`;
      } else {
        gdpText = `${(item.gdp / 1e9).toFixed(1)} میلیارد دلار`;
      }

      let popText = "";
      if (item.population >= 1e9) {
        popText = `${(item.population / 1e9).toFixed(2)} میلیارد نفر`;
      } else {
        popText = `${(item.population / 1e6).toFixed(1)} میلیون نفر`;
      }

      let power = "قدرت منطقه‌ای";
      if (item.gdp >= 10e12) power = "ابرقدرت جهانی";
      else if (item.gdp >= 1e12) power = "قدرت برتر صنعتی";
      else if (item.gdp >= 200e9) power = "قدرت فرامنطقه‌ای";

      return {
        id: item.id,
        name: item.nameFa,
        code: item.flagCode.toUpperCase(),
        rank: item.initialRank,
        power,
        gdp: gdpText,
        population: popText,
        treasury: PersianNumberFormatter.formatCurrency(computedTreasury),
        desc: `شناسنامه استراتژیک رسمی ${item.nameFa} با رتبه جهانی #${item.initialRank}، ساختار اقتصادی به ارزش ${gdpText} و مساحت ${item.territorySize.toLocaleString("fa-IR")} km².`,
        defaultGovernment: item.defaultGovernment,
      };
    });
  }

  public getAllSelectableNations(
    presentCountryIds?: Set<number> | number[],
  ): NationDetail[] {
    let profiles = [...ALL_COUNTRY_PROFILES];

    if (presentCountryIds) {
      const validSet = new Set(
        Array.isArray(presentCountryIds)
          ? presentCountryIds
          : Array.from(presentCountryIds),
      );
      profiles = profiles.filter((p) => validSet.has(p.id));
    }

    const sorted = profiles.sort((a, b) => b.gdp - a.gdp);

    return sorted.map((profile: CountryProfile, index: number) => {
      const computedTreasury = Math.floor(profile.gdp * 0.05);

      let gdpText = "";
      if (profile.gdp >= 1e12) {
        gdpText = `${(profile.gdp / 1e12).toFixed(1)} تریلیارد دلار`;
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
        treasury: PersianNumberFormatter.formatCurrency(computedTreasury),
        desc: `شناسنامه استراتژیک رسمی ${profile.nameFa} با ساختار اقتصادی به ارزش ${gdpText} و جمعیت ${popText}.`,
        defaultGovernment: profile.startingGovernment ?? "DEMOCRACY",
      };
    });
  }
}
