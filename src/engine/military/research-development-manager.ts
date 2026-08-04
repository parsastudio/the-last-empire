import { Nation } from "@/domain/nation/nation.schema";
import { ResearchManager } from "@/engine/politics/research-manager";

export class ResearchDevelopmentManager {
  private researchManager = new ResearchManager();

  public getResearchCost(nation: Nation): number {
    return this.researchManager.getMilitaryTechCost(nation);
  }

  public investInResearch(nation: Nation): Nation {
    return this.researchManager.investInMilitaryTech(nation);
  }
}
