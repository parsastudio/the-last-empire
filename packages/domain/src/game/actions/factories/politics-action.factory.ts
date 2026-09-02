import { InvestResearchAction } from "@/domain/game/actions/schemas/politics-action.schema";

export class PoliticsActionFactory {
  private static createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }

  public static investResearch(nationId: string): InvestResearchAction {
    return {
      id: this.createId("research"),
      nationId,
      type: "INVEST_RESEARCH",
    };
  }
}
