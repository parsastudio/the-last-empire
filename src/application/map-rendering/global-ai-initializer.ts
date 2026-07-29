import { Nation } from "@/domain/nation/nation.schema";
import { GovernmentType } from "@/domain/politics/politics.schema";
import { NationProfileAssigner } from "./nation-profile-assigner";
import { DiplomaticMatrixGenerator } from "./diplomatic-matrix-generator";
import { ALL_COUNTRY_PROFILES } from "@/domain/map/countries";
import { PowerScoreRanker } from "@/engine/diplomacy/power-score-ranker";

export class GlobalAiInitializer {
  private profileAssigner = new NationProfileAssigner();
  private relationsGenerator = new DiplomaticMatrixGenerator();
  private ranker = new PowerScoreRanker();

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

    const rawList = Object.values(nations).map((n) => ({
      id: n.id,
      gdp: n.gdp,
      treasury: n.treasury,
      infantry: n.military.infantry,
      airForce: n.military.airForce,
      drone: n.military.droneMissile,
      techLevel: n.military.techLevel,
    }));

    const ranked = this.ranker.rankNations(rawList);

    for (const item of ranked) {
      if (nations[item.id]) {
        nations[item.id].rank = item.rank;
      }
    }

    return nations;
  }
}
