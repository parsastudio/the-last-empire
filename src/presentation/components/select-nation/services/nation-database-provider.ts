import { NationDetail } from "@/presentation/components/select-nation/nation-list-item";
import { FinalManifestNation as ManifestNationItem } from "@/infrastructure/map-preprocessing/final/final-manifest-builder";
import { CountryRegistry } from "@/domain/data/countries";
import { NationPresentationMapper } from "@/presentation/utils/nation-presentation-mapper";

export class NationDatabaseProvider {
  private formatNationDetail(
    id: string,
    nameFa: string,
    code: string,
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
      code,
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

      return this.formatNationDetail(
        item.id,
        item.nameFa,
        item.code,
        item.flagCode,
        item.initialRank,
        item.gdp,
        item.population,
        item.defaultGovernment,
        desc,
      );
    });
  }

  public getAllSelectableNations(): NationDetail[] {
    const manifestItems = CountryRegistry.getAllManifestNations();
    if (manifestItems.length > 0) {
      return this.getNationsFromManifest(manifestItems);
    }
    return [];
  }
}
