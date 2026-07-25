import { GridCell } from "@/domain/map/grid-cell.schema";
import { AiGridCampaignGenerator } from "@/engine/combat/ai/ai-grid-campaign-generator";

export class AiGridCampaignManager {
  private generator = new AiGridCampaignGenerator();

  public evaluateCampaignPriorities(
    attackerId: string,
    allNationsIds: string[],
    allCells: GridCell[],
  ): string[] {
    const campaigns = this.generator.generateCampaignTargets(
      attackerId,
      allNationsIds,
      allCells,
    );

    return Array.from(campaigns.keys()).sort();
  }
}
