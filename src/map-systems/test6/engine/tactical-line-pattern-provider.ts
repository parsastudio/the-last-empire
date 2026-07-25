import { TacticalLinePattern } from "./tactical-line-pattern";

export class TacticalLinePatternProvider {
  private pattern = new TacticalLinePattern();

  public getTacticalLineDash(type: "dotted" | "dashed" | "solid"): number[] {
    if (type === "dotted") return this.pattern.getDottedLinePattern();
    if (type === "dashed") return this.pattern.getDashedLinePattern();
    return this.pattern.getSolidLinePattern();
  }
}
