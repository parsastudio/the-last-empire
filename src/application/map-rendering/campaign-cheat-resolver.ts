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
      attackerMilitary: {
        infantry: 1000,
        airForce: 500,
        droneMissile: 500,
        experience: 100,
        techLevel: 5,
      },
      defenderMilitary: {
        infantry: 0,
        airForce: 0,
        droneMissile: 0,
        experience: 0,
        techLevel: 1,
      },
    });
  }
}
