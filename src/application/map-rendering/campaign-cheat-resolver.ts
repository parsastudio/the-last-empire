import { GridCell } from "@/domain/map/grid-cell.schema";
import { ConquestOrchestrator } from "@/engine/combat/orchestrator/conquest-orchestrator";

export class CampaignCheatResolver {
  private orchestrator = new ConquestOrchestrator();

  public resolveGuaranteedInvasion(
    attackerId: string,
    targetCountryId: string,
    targetPixel: { x: number; y: number },
    allCells: GridCell[],
  ): {
    conqueredCells: GridCell[];
    capitulatedCells: GridCell[];
  } {
    return this.orchestrator.executeAttack({
      attackerId,
      targetCountryId,
      targetPixel,
      allCells,
      attackerForcePower: 999999,
      defenderForcePower: 0,
    });
  }
}
