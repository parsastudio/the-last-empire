import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import {
  BuildFactoryAction,
  EquipDomesticMachineryAction,
  BuyIndustrialEquipmentAction,
} from "@/domain/game/action.schema";
import { BuildFactoryExecutor } from "@/engine/actions/executors/economy/factory/build-factory.executor";
import { EquipDomesticMachineryExecutor } from "@/engine/actions/executors/economy/factory/equip-domestic-machinery.executor";
import { InvestIndustrialResearchExecutor } from "@/engine/actions/executors/economy/factory/invest-industrial-research.executor";
import { BuyIndustrialEquipmentExecutor } from "@/engine/actions/executors/economy/factory/buy-industrial-equipment.executor";
import { ExecutionResult } from "@/engine/actions/execution-result";

export class FactoryActionExecutor {
  public static executeBuildFactory(
    state: GameState,
    action: BuildFactoryAction,
    nation: Nation,
    buyerKey: string,
  ): ExecutionResult {
    return BuildFactoryExecutor.execute(state, action, nation, buyerKey);
  }

  public static executeEquipDomesticMachinery(
    state: GameState,
    action: EquipDomesticMachineryAction,
    nation: Nation,
    buyerKey: string,
  ): ExecutionResult {
    return EquipDomesticMachineryExecutor.execute(
      state,
      action,
      nation,
      buyerKey,
    );
  }

  public static executeInvestIndustrialResearch(
    state: GameState,
    nation: Nation,
    buyerKey: string,
  ): ExecutionResult {
    return InvestIndustrialResearchExecutor.execute(state, nation, buyerKey);
  }

  public static executeBuyIndustrialEquipment(
    state: GameState,
    action: BuyIndustrialEquipmentAction,
    buyer: Nation,
    buyerKey: string,
  ): ExecutionResult {
    return BuyIndustrialEquipmentExecutor.execute(
      state,
      action,
      buyer,
      buyerKey,
    );
  }
}
