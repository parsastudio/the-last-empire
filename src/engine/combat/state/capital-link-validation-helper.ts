import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { CapitalLinkAnalyzer } from "@/engine/combat/state/capital-link-analyzer";

export class CapitalLinkValidationHelper {
  private analyzer = new CapitalLinkAnalyzer();

  public isEnclaveLinkedToCapital(
    capital: Coordinate,
    enclaveCells: GridCell[],
    allCells: GridCell[],
  ): boolean {
    return this.analyzer.hasDirectCapitalSupplyLink(
      capital,
      enclaveCells,
      allCells,
    );
  }
}
