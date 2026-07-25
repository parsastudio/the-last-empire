import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { ContiguousTheaterBfs } from "@/engine/combat/bfs/contiguous-theater-bfs";
import { ConquestCapper } from "@/engine/combat/capping/conquest-capper";
import { SovereignHopBfs } from "@/engine/combat/bfs/sovereign-hop-bfs";
import { CapitulationEngine } from "@/engine/combat/capitulation/capitulation-engine";

export class ConquestOrchestrator {
  private theaterBfs = new ContiguousTheaterBfs();
  private capper = new ConquestCapper();
  private hopBfs = new SovereignHopBfs();
  private capitulation = new CapitulationEngine();

  public executeAttack(
    attackerId: string,
    targetCountryId: string,
    targetPixel: Coordinate,
    allCells: GridCell[],
  ): {
    conqueredCells: GridCell[];
    capitulatedCells: GridCell[];
  } {
    const theaterCells = this.theaterBfs.findTheaterCells(
      targetCountryId,
      targetPixel,
      allCells,
    );
    const globalDefenderCells = allCells.filter(
      (c) => c.ownerId === targetCountryId,
    );

    const targetPixelLimit = this.capper.calculateCappedTarget(
      globalDefenderCells.length,
      theaterCells.length,
    );

    const conqueredCells = this.hopBfs.executeHopBfs(
      targetCountryId,
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
    };
  }
}
