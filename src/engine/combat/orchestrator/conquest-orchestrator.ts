import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { ContiguousTheaterBfs } from "@/engine/combat/bfs/contiguous-theater-bfs";
import { ConquestCapper } from "@/engine/combat/capping/conquest-capper";
import { SovereignHopBfs } from "@/engine/combat/bfs/sovereign-hop-bfs";
import { CapitulationEngine } from "@/engine/combat/capitulation/capitulation-engine";
import { CombatCasualtyCalculator } from "../math/combat-casualty-calculator";
import { HomelandMilitiaCalculator } from "../math/homeland-militia-calculator";

export interface ExecutionAttackParams {
  attackerId: string;
  targetCountryId: string;
  targetPixel: Coordinate;
  allCells: GridCell[];
  attackerForcePower: number;
  defenderForcePower: number;
  defenderPopulation?: number;
  defenderStability?: number;
}

export class ConquestOrchestrator {
  private theaterBfs = new ContiguousTheaterBfs();
  private capper = new ConquestCapper();
  private hopBfs = new SovereignHopBfs();
  private capitulation = new CapitulationEngine();
  private casualtyCalculator = new CombatCasualtyCalculator();
  private militiaCalculator = new HomelandMilitiaCalculator();

  public executeAttack(params: ExecutionAttackParams): {
    conqueredCells: GridCell[];
    capitulatedCells: GridCell[];
    attackerLost: number;
    defenderLost: number;
    attackerRetreated: number;
    defenderRetreated: number;
    isVictory: boolean;
  } {
    const {
      attackerId,
      targetCountryId,
      targetPixel,
      allCells,
      attackerForcePower,
      defenderForcePower,
      defenderPopulation = 10000000,
      defenderStability = 70,
    } = params;

    const militiaPower = this.militiaCalculator.calculateMilitiaGarrisonPower(
      defenderPopulation,
      defenderStability,
    );

    const effectiveDefenderPower = defenderForcePower + militiaPower;
    const isVictory = attackerForcePower > effectiveDefenderPower;

    const casualties = this.casualtyCalculator.calculateCappedCasualties(
      attackerForcePower,
      defenderForcePower,
      isVictory,
    );

    if (!isVictory) {
      return {
        conqueredCells: [],
        capitulatedCells: [],
        attackerLost: casualties.attackerLost,
        defenderLost: casualties.defenderLost,
        attackerRetreated: casualties.attackerRetreated,
        defenderRetreated: casualties.defenderRetreated,
        isVictory: false,
      };
    }

    const targetCellMatch = allCells.find(
      (c) => c.x === targetPixel.x && c.y === targetPixel.y,
    );
    const targetEnclaveId = targetCellMatch ? targetCellMatch.enclaveId : 0;

    const theaterCells = this.theaterBfs.findTheaterCells(
      targetCountryId,
      targetPixel,
      allCells,
    );

    const targetPixelLimit = this.capper.calculateCappedTarget(
      theaterCells.length,
    );

    const conqueredCells = this.hopBfs.executeHopBfs(
      targetCountryId,
      targetEnclaveId,
      targetPixel,
      allCells,
      targetPixelLimit,
    );

    for (const cell of conqueredCells) {
      cell.isOccupied = true;
      cell.occupierId = attackerId;
    }

    const capitulatedCells = this.capitulation.processCapitulation(
      targetCountryId,
      attackerId,
      allCells,
    );

    return {
      conqueredCells,
      capitulatedCells,
      attackerLost: casualties.attackerLost,
      defenderLost: casualties.defenderLost,
      attackerRetreated: casualties.attackerRetreated,
      defenderRetreated: casualties.defenderRetreated,
      isVictory: true,
    };
  }
}
