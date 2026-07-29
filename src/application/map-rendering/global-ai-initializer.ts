import { Nation } from "@/domain/nation/nation.schema";
import { GovernmentType } from "@/domain/politics/politics.schema";
import { NationProfileAssigner } from "./nation-profile-assigner";
import { DiplomaticMatrixGenerator } from "./diplomatic-matrix-generator";
import { ALL_COUNTRY_PROFILES } from "@/domain/map/countries";

export class GlobalAiInitializer {
  private profileAssigner = new NationProfileAssigner();
  private relationsGenerator = new DiplomaticMatrixGenerator();

  public initializeAllNations(
    detectedNationsList: string[],
    humanNationId: string,
    humanGovType?: GovernmentType | string,
  ): Record<string, Nation> {
    const nations: Record<string, Nation> = {};

    const allProfileIds = ALL_COUNTRY_PROFILES.map((p) => `NATION_${p.id}`);
    const fullNationsList = Array.from(
      new Set([...detectedNationsList, ...allProfileIds, humanNationId]),
    );

    for (const id of fullNationsList) {
      const isHuman = id === humanNationId;
      const govToApply = isHuman ? humanGovType : undefined;
      const nation = this.profileAssigner.buildStartingNation(
        id,
        isHuman,
        govToApply,
      );

      const relativeList = fullNationsList.filter((nId) => nId !== id);
      nation.relations =
        this.relationsGenerator.generateBlankRelations(relativeList);

      nations[id] = nation;
    }

    return nations;
  }
}
