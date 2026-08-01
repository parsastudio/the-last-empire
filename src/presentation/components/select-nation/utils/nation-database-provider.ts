import { ALL_COUNTRY_PROFILES, CountryProfile } from "@/domain/data/countries";
import { NationDetail } from "@/presentation/components/select-nation/nation-list-item";
import { ManifestNationItem } from "@/infrastructure/map-preprocessing/generator/map-manifest-builder";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export class NationDatabaseProvider {
  private formatNationDetail(
    id: string,
    nameFa: string,
    flagCode: string,
    rank: number,
    gdp: number,
    population: number,
    defaultGovernment: string,
    descriptionOverride?: string,
  ): NationDetail {
    const computedTreasury = Math.floor(gdp * 0.05);

    let gdpText = "";
    if (gdp >= 1e12) {
      gdpText = `${(gdp / 1e12).toFixed(1)} تریلیارد دلار`;
    } else {
      gdpText = `${(gdp / 1e9).toFixed(1)} میلیارد دلار`;
    }

    let popText = "";
    if (population >= 1e9) {
      popText = `${(population / 1e9).toFixed(2)} میلیارد نفر`;
    } else {
      popText = `${(population / 1e6).toFixed(1)} میلیون نفر`;
    }

    let power = "قدرت منطقه‌ای";
    if (gdp >= 10e12) power = "ابرقدرت جهانی";
    else if (gdp >= 1e12) power = "قدرت برتر صنعتی";
    else if (gdp >= 200e9) power = "قدرت فرامنطقه‌ای";

    const desc =
      descriptionOverride ||
      `شناسنامه استراتژیک رسمی ${nameFa} با ساختار اقتصادی به ارزش ${gdpText} و جمعیت ${popText}.`;

    return {
      id,
      name: nameFa,
      code: flagCode.toUpperCase(),
      rank,
      power,
      gdp: gdpText,
      population: popText,
      treasury: PersianNumberFormatter.formatCurrency(computedTreasury),
      desc,
      defaultGovernment,
    };
  }

  public getNationsFromManifest(
    manifestNations: ManifestNationItem[],
  ): NationDetail[] {
    return manifestNations.map((item) => {
      let gdpText = "";
      if (item.gdp >= 1e12) {
        gdpText = `${(item.gdp / 1e12).toFixed(1)} تریلیارد دلار`;
      } else {
        gdpText = `${(item.gdp / 1e9).toFixed(1)} میلیارد دلار`;
      }

      const desc = `شناسنامه استراتژیک رسمی ${item.nameFa} با رتبه جهانی #${item.initialRank}، ساختار اقتصادی به ارزش ${gdpText} و مساحت ${item.territorySize.toLocaleString("fa-IR")} km².`;

      return this.formatNationDetail(
        item.id,
        item.nameFa,
        item.flagCode,
        item.initialRank,
        item.gdp,
        item.population,
        item.defaultGovernment,
        desc,
      );
    });
  }

  public getAllSelectableNations(
    presentCountryIds?: Set<number | string> | (number | string)[],
  ): NationDetail[] {
    let profiles = [...ALL_COUNTRY_PROFILES];

    if (presentCountryIds) {
      const validSet = new Set(
        Array.isArray(presentCountryIds)
          ? presentCountryIds
          : Array.from(presentCountryIds),
      );
      profiles = profiles.filter(
        (p) =>
          validSet.has(p.code) ||
          validSet.has(p.flagCode) ||
          validSet.has(`NATION_${p.code}`),
      );
    }

    const sorted = profiles.sort((a, b) => b.gdp - a.gdp);

    return sorted.map((profile: CountryProfile, index: number) => {
      return this.formatNationDetail(
        `NATION_${profile.code}`,
        profile.nameFa,
        profile.flagCode,
        index + 1,
        profile.gdp,
        profile.population,
        profile.startingGovernment ?? "DEMOCRACY",
      );
    });
  }
}
