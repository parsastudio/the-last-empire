import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  NationGettersUtility,
} from "@geopolitics/domain";

export class AINavalProcurementPlanner {
  public static readonly FLEET_COST = 50_000_000_000;
  public static readonly MIN_TREASURY_THRESHOLD = 80_000_000_000;

  public static planNaval(
    nation: Nation,
    effectiveTreasury: number,
    provincesMap?: Record<string, Province>,
  ): { action: GameAction | null; cost: number } {
    const hasSea = NationGettersUtility.hasSeaAccess(nation.id, provincesMap);
    const currentFleet = nation.navalFleet || 0;
    const totalInfantry = nation.military.infantry || 0;
    const totalArmor = nation.military.armor || 0;
    const currentCapacity = currentFleet * 60;
    const targetCapacity = totalInfantry * 1 + totalArmor * 4;

    if (
      hasSea &&
      effectiveTreasury >= this.MIN_TREASURY_THRESHOLD &&
      currentCapacity < targetCapacity
    ) {
      return {
        action: ActionFactory.buyNavalFleet(nation.id, 1),
        cost: this.FLEET_COST,
      };
    }

    return { action: null, cost: 0 };
  }
}
