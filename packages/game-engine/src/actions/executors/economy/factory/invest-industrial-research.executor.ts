import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";
import { ExecutionResult } from "@/engine/actions/execution-result";

export class InvestIndustrialResearchExecutor {
  public static execute(
    state: GameState,
    nation: Nation,
    buyerKey: string,
  ): ExecutionResult<{ nextIndustrialLevel: number; cost: number }> {
    const cost = IndustryCalculator.calculateResearchStepCost(
      nation.industrialLevel,
      nation.government?.type,
    );
    if (nation.treasury < cost) {
      throw new GameError("INSUFFICIENT_FUNDS");
    }

    const nextIndustrialLevel = Number(
      (nation.industrialLevel + IndustryCalculator.RESEARCH_STEP).toFixed(2),
    );

    const { updatedProvinces, updatedFactoryTiers, updatedEquipmentTech } =
      IndustryCalculator.syncProvincesAndNationFloor(
        nation.id,
        nextIndustrialLevel,
        state.provinces,
      );

    const newState: GameState = {
      ...state,
      provinces: updatedProvinces,
      nations: {
        ...state.nations,
        [buyerKey]: {
          ...nation,
          treasury: nation.treasury - cost,
          industrialLevel: nextIndustrialLevel,
          factoryTiers: updatedFactoryTiers,
          equipmentTechLevel: updatedEquipmentTech,
        },
      },
    };

    return {
      newState,
      resultData: {
        nextIndustrialLevel,
        cost,
      },
    };
  }
}
