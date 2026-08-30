import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  NationGettersUtility,
  NAVAL_FLEET_CONFIG,
} from "@geopolitics/domain";
import { NavalDeploymentClamper } from "@/engine/combat/optimizer/naval-deployment-clamper";

export class AINavalProcurementPlanner {
  public static planNaval(
    nation: Nation,
    effectiveTreasury: number,
    provincesMap?: Record<string, Province>,
  ): { action: GameAction | null; cost: number } {
    const hasSea = NationGettersUtility.hasSeaAccess(nation.id, provincesMap);
    const currentFleet = nation.navalFleet || 0;
    const totalInfantry = nation.military.infantry || 0;
    const totalArmor = nation.military.armor || 0;
    const currentCapacity = NavalDeploymentClamper.calculateMaxCapacity(
      "NAVAL",
      currentFleet,
    );
    const targetCapacity = NavalDeploymentClamper.calculateRequiredCapacity(
      totalInfantry,
      totalArmor,
    );

    if (
      hasSea &&
      effectiveTreasury >= NAVAL_FLEET_CONFIG.MIN_TREASURY_THRESHOLD &&
      currentCapacity < targetCapacity
    ) {
      return {
        action: ActionFactory.buyNavalFleet(nation.id, 1),
        cost: NAVAL_FLEET_CONFIG.FLEET_UNIT_COST,
      };
    }

    return { action: null, cost: 0 };
  }
}
