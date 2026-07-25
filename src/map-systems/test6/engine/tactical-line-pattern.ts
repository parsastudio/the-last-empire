export class TacticalLinePattern {
  public getDottedLinePattern(): number[] {
    return [3, 3];
  }

  public getDashedLinePattern(): number[] {
    return [6, 4];
  }

  public getSolidLinePattern(): number[] {
    return [];
  }
}
