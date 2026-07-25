import { GridCell } from "@/domain/map/grid-cell.schema";
import { Coordinate } from "@/domain/map/coordinate.schema";
import { AiGridAttackPlanner } from "@/engine/combat/ai/ai-grid-attack-planner";

export class AiGridCampaignGenerator {
  private planner = new AiGridAttackPlanner();

  public generateCampaignTargets(
    attackerId: string,
    allNationsIds: string[],
    allCells: GridCell[],
  ): Map<string, Coordinate> {
    const campaigns = new Map<string, Coordinate>();

    for (const defenderId of allNationsIds) {
      if (defenderId !== attackerId) {
        const target = this.planner.planBestTargetPixel(
          attackerId,
          defenderId,
          allCells,
        );

        if (target) {
          campaigns.set(defenderId, target);
        }
      }
    }

    return campaigns;
  }
}
