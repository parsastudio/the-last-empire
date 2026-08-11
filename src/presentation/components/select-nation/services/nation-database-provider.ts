import { NationDetail } from "@/presentation/components/select-nation/nation-list-item";
import { FinalManifestNation as ManifestNationItem } from "@/infrastructure/map-preprocessing/final/final-manifest-builder";
import { ALL_COUNTRY_PROFILES, CountryProfile } from "@/domain/data/countries";
import { NationPresentationMapper } from "@/presentation/utils/nation-presentation-mapper";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

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
    const mapped = NationPresentationMapper.formatNationSummary(
      id,
      nameFa,
      flagCode,
      flagCode,
      rank,
      gdp,
      population,
      defaultGovernment,
    );

    const desc =
      descriptionOverride ||
      `شناسنامه استراتژیک رسمی ${nameFa} با ساختار اقتصادی به ارزش ${mapped.gdpText} و جمعیت ${mapped.populationText}.`;

    return {
      id,
      name: mapped.name,
      code: mapped.code,
      rank: mapped.rank,
      power: mapped.powerLabel,
      gdp: mapped.gdpText,
      population: mapped.populationText,
      treasury: mapped.treasuryText,
      desc,
      defaultGovernment,
    };
  }

  public getNationsFromManifest(
    manifestNations: ManifestNationItem[],
  ): NationDetail[] {
    return manifestNations.map((item) => {
      const desc = `شناسنامه استراتژیک رسمی ${item.nameFa} با رتبه جهانی #${item.initialRank}.`;
      const computedGdp = getNationGdp({
        population: item.population,
        perCapitaProductivity: item.perCapitaProductivity,
      });

      return this.formatNationDetail(
        item.id,
        item.nameFa,
        item.flagCode,
        item.initialRank,
        computedGdp,
        item.population,
        item.defaultGovernment,
        desc,
      );
    });
  }

  public getAllSelectableNations(): NationDetail[] {
    const sorted = [...ALL_COUNTRY_PROFILES].sort((a, b) => b.gdp - a.gdp);

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
