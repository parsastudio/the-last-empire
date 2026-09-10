import { InvestResearchAction } from "@/domain/game/actions/schemas/politics-action.schema";
import { GameIdGenerator } from "@/domain/shared/utils/game-id-generator";

export class PoliticsActionFactory {
  public static investResearch(nationId: string): InvestResearchAction {
    return {
      id: GameIdGenerator.generateId("research"),
      nationId,
      type: "INVEST_RESEARCH",
    };
  }
}
