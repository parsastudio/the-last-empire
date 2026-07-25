import { GridState } from "@/engine/combat/state/grid-state";
import { GridStateFactory } from "./grid-state-factory";

export class GridStateFactoryService {
  private factory = new GridStateFactory();

  public buildDefaultGridState(): GridState {
    return this.factory.createEmptyGrid();
  }
}
