import { Nation } from "@/domain/nation/nation.schema";

export class BattleLogisticsValidator {
  public canAffordDeploy(attacker: Nation, cost: number): boolean {
    return attacker.treasury >= cost;
  }
}
