import { GameState } from "@/domain/game/game-state.schema";
import { EquipDomesticMachineryAction } from "@/domain/game/action.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";
import { ExecutionResult } from "@/engine/actions/execution-result";
import { FactoryModernizationRunner } from "@/engine/actions/executors/economy/factory/factory-modernization-runner";

export class EquipDomesticMachineryExecutor {
  public static execute(
    state: GameState,
    action: EquipDomesticMachineryAction,
    nation: Nation,
    buyerKey: string,
  ): ExecutionResult<{ modernizedCount: number; totalCost: number }> {
    const result = FactoryModernizationRunner.run({
      state,
      nation,
      quantity: action.quantity,
      sourceTechLevel: action.sourceTechLevel,
      targetTech: nation.industrialLevel,
      calculateUnitCost: (sourceTech, targetTech) =>
        IndustryCalculator.calculateModernizeUnitCost(sourceTech, targetTech),
    });

    const newState: GameState = {
      ...state,
      provinces: result.updatedProvinces,
      nations: {
        ...state.nations,
        [buyerKey]: {
          ...nation,
          treasury: nation.treasury - result.totalCost,
          factoryTiers: result.updatedBatches,
          equipmentTechLevel: result.newEquipTech,
        },
      },
    };

    return {
      newState,
      resultData: {
        modernizedCount: result.modernizedCount,
        totalCost: result.totalCost,
      },
    };
  }
}
