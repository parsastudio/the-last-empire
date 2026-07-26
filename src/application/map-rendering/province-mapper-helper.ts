import { GridCell } from "@/domain/map/grid-cell.schema";
import { Province } from "@/domain/map/province.schema";

export class ProvinceMapperHelper {
  public mapCellsToProvinceList(cells: GridCell[]): Province[] {
    const provinces: Province[] = [];
    const grouped = new Map<string, GridCell[]>();

    for (const cell of cells) {
      const owner = cell.ownerId;
      const list = grouped.get(owner) || [];
      list.push(cell);
      grouped.set(owner, list);
    }

    for (const [owner, cellList] of grouped.entries()) {
      if (owner === "WATER") {
        continue;
      }
      provinces.push({
        id: `province_${owner}`,
        name: `${owner} Autonomous Zone`,
        ownerNationId: owner,
        gdp: cellList.length * 250000,
        population: cellList.length * 5000,
        isCapital: true,
        territorySize: cellList.length * 86.3,
        x: cellList[0]?.x || 0,
        y: cellList[0]?.y || 0,
        isCoastal: true,
        isOccupied: false,
        neighbors: [],
      });
    }

    return provinces;
  }
}
