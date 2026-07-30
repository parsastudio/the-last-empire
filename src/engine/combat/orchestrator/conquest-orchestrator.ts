import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { MilitaryStack } from "@/domain/military/military.schema";

export interface ExecutionAttackParams {
  attackerId: string;
  targetCountryId: string;
  targetPixel: Coordinate;
  allCells: GridCell[];
  attackerForcePower: number;
  defenderForcePower: number;
  attackerMilitary: MilitaryStack;
  defenderMilitary: MilitaryStack;
  defenderPopulation?: number;
  defenderStability?: number;
}

export class ConquestOrchestrator {
  public executeAttack(params: ExecutionAttackParams) {
    return {
      conqueredCells: [],
      capitulatedCells: [],
      casualtyDetails: {
        attackerLostStack: {
          ...params.attackerMilitary,
          infantry: 0,
          airForce: 0,
          droneMissile: 0,
        },
        defenderLostStack: {
          ...params.defenderMilitary,
          infantry: 0,
          airForce: 0,
          droneMissile: 0,
        },
        attackerRetreatedStack: { ...params.attackerMilitary },
        defenderRetreatedStack: { ...params.defenderMilitary },
        attackerTotalLossPoints: 0,
        defenderTotalLossPoints: 0,
      },
      isVictory: false,
    };
  }
}
