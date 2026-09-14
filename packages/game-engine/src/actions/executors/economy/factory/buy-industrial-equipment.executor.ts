import { GameState } from "@/domain/game/game-state.schema";
import { BuyIndustrialEquipmentAction } from "@/domain/game/action.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { GameError, TurnLogBuilder } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";
import {
  DiplomacyTradeValidator,
  GameStateMetricsUtility,
  NationGettersUtility,
} from "@geopolitics/domain";
import { ExecutionResult } from "@/engine/actions/execution-result";
import { FactoryModernizationRunner } from "@/engine/actions/executors/economy/factory/factory-modernization-runner";

export class BuyIndustrialEquipmentExecutor {
  public static execute(
    state: GameState,
    action: BuyIndustrialEquipmentAction,
    buyer: Nation,
    buyerKey: string,
  ): ExecutionResult<{
    quantity: number;
    totalCost: number;
    sellerId: string;
  }> {
    const seller = NationGettersUtility.resolveNation(
      action.sellerNationId,
      state.nations,
    );

    if (!seller || !seller.isAlive) {
      throw new GameError("SELLER_NOT_FOUND");
    }

    if (!DiplomacyTradeValidator.isEligibleMachinerySeller(buyer, seller)) {
      throw new GameError("DIPLOMATIC_TENSION");
    }

    const sellerTech = seller.industrialLevel;

    const result = FactoryModernizationRunner.run({
      state,
      nation: buyer,
      quantity: action.quantity,
      sourceTechLevel: action.sourceTechLevel,
      targetTech: sellerTech,
      calculateUnitCost: (sourceTech, targetTech) =>
        IndustryCalculator.calculateEquipmentImportPrice(
          targetTech,
          sourceTech,
          buyer.industrialLevel,
        ),
    });

    const sellerCanonical = CountryRegistry.resolveCanonicalId(seller.id);
    const sellerKey = state.nations[sellerCanonical]
      ? sellerCanonical
      : seller.id;

    const isHumanSeller = GameStateMetricsUtility.isHumanNation(
      state.humanNationId,
      seller.id,
    );

    const logs = [];
    if (isHumanSeller && result.totalCost > 0) {
      logs.push(
        TurnLogBuilder.createNationalLog(
          state.currentTurn,
          seller.id,
          "DOMESTIC",
          "INFO",
          "ARMS_TRADE",
          {
            amount: result.totalCost,
            role: "SELLER",
            tradeType: "MACHINERY",
          },
          buyer.id,
        ),
      );
    }

    const newState: GameState = {
      ...state,
      provinces: result.updatedProvinces,
      turnLogs: [...state.turnLogs, ...logs],
      nations: {
        ...state.nations,
        [buyerKey]: {
          ...buyer,
          treasury: buyer.treasury - result.totalCost,
          factoryTiers: result.updatedBatches,
          equipmentTechLevel: result.newEquipTech,
        },
        [sellerKey]: {
          ...seller,
          treasury: seller.treasury + result.totalCost,
        },
      },
    };

    return {
      newState,
      resultData: {
        quantity: result.modernizedCount,
        totalCost: result.totalCost,
        sellerId: seller.id,
      },
      logs,
    };
  }
}
