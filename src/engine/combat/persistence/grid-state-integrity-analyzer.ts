import { GridStateIntegrityChecker } from "./grid-state-integrity-checker";

export class GridStateIntegrityAnalyzer {
  private checker = new GridStateIntegrityChecker();

  public verifyState(serialized: string): boolean {
    return this.checker.isIntegrityValid(serialized);
  }
}
