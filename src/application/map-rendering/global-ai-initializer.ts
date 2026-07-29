import { Nation } from "@/domain/nation/nation.schema";
import { GovernmentType } from "@/domain/politics/politics.schema";
import { NationProfileAssigner } from "./nation-profile-assigner";
import { DiplomaticMatrixGenerator } from "./diplomatic-matrix-generator";

export class GlobalAiInitializer {
  private profileAssigner = new NationProfileAssigner();
  private relationsGenerator = new DiplomaticMatrixGenerator();

  public initializeAllNations(
    detectedNationsList: string[],
    humanNationId: string,
    humanGovType?: GovernmentType | string,
  ): Record<string, Nation> {
    const nations: Record<string, Nation> = {};

    for (const id of detectedNationsList) {
      const isHuman = id === humanNationId;
      const govToApply = isHuman ? humanGovType : undefined;
      const nation = this.profileAssigner.buildStartingNation(
        id,
        isHuman,
        govToApply,
      );

      const relativeList = detectedNationsList.filter((nId) => nId !== id);
      nation.relations =
        this.relationsGenerator.generateBlankRelations(relativeList);

      nations[id] = nation;
    }

    return nations;
  }
}
