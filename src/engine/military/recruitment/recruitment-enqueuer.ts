import { Nation } from "@/domain/nation/nation.schema";
import { UnitType, RecruitmentOrder } from "@/domain/military/military.schema";
import { GameError } from "@/domain/shared/game-error";
import { UnitCostCalculator } from "@/engine/military/unit-cost-calculator";
import { ResourceDependencyManager } from "@/engine/economy/resource-dependency-manager";

export class RecruitmentEnqueuer {
  private costCalculator = new UnitCostCalculator();
  private resourceDependencyManager = new ResourceDependencyManager();

  public enqueueOrder(
    nation: Nation,
    unitType: UnitType,
    quantity: number,
  ): Nation {
    this.resourceDependencyManager.validateUnitRecruitmentResources(
      nation,
      unitType,
      quantity,
    );

    const costDetails = this.costCalculator.calculateTotalCost(
      unitType,
      quantity,
      nation.industrialLevel,
    );

    if (nation.treasury < costDetails.moneyCost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "Not enough money in treasury for recruitment",
      );
    }

    if (nation.resources.manpower < costDetails.manpowerCost) {
      throw new GameError(
        "INSUFFICIENT_RESOURCES",
        "Not enough manpower available for recruitment",
      );
    }

    const newOrder: RecruitmentOrder = {
      id: `${unitType}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      unitType,
      quantity,
      turnsRemaining: costDetails.buildTurns,
      totalCost: costDetails.moneyCost,
      manpowerRequired: costDetails.manpowerCost,
    };

    let finalSteel = nation.resources.steel;
    if (unitType === "AIR_FORCE" || unitType === "DRONE_MISSILE") {
      finalSteel = Math.max(0, finalSteel - quantity * 2);
    }

    return {
      ...nation,
      treasury: nation.treasury - costDetails.moneyCost,
      resources: {
        ...nation.resources,
        manpower: nation.resources.manpower - costDetails.manpowerCost,
        steel: finalSteel,
      },
      recruitmentQueue: [...nation.recruitmentQueue, newOrder],
    };
  }
}
