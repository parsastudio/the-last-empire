import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { UnitType } from "@/domain/military/military.schema";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { GameError, TurnLogBuilder } from "@/domain/shared/domain-utilities";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { MilitaryQuotaCalculator } from "@/domain/military/military-quota-calculator.utility";
import {
  DiplomacyTradeValidator,
  NationGettersUtility,
  GameStateMetricsUtility,
} from "@geopolitics/domain";

export class ArmsMarketManager {
  public static executePurchase(
    state: GameState,
    buyerId: string,
    sellerId: string,
    unitType: UnitType,
    quantity: number,
  ): GameState {
    if (quantity <= 0) {
      throw new GameError("INVALID_QUANTITY");
    }

    const buyer = NationGettersUtility.resolveNation(buyerId, state.nations);
    const seller = NationGettersUtility.resolveNation(sellerId, state.nations);

    if (!buyer || !buyer.isAlive) {
      throw new GameError("BUYER_NOT_FOUND");
    }
    if (!seller || !seller.isAlive) {
      throw new GameError("SELLER_NOT_FOUND");
    }

    if (!DiplomacyTradeValidator.isEligibleArmsSeller(buyer, seller)) {
      if (seller.military.techLevel <= buyer.military.techLevel) {
        throw new GameError("TECH_NOT_SUPERIOR");
      }
      throw new GameError("DIPLOMATIC_TENSION");
    }

    const baseUnitPrice =
      MilitaryPricingCalculator.calculateUnitTypePrice(unitType);
    const marketPricePerUnit =
      MilitaryPricingCalculator.calculateArmsImportUnitPrice(
        unitType,
        buyer.military.techLevel,
        seller.military.techLevel,
      );
    const totalCost = marketPricePerUnit * quantity;

    if (buyer.treasury < totalCost) {
      throw new GameError("INSUFFICIENT_FUNDS");
    }

    const buyerGdp = getNationGdp(buyer, state.provinces);
    const currentValuation =
      MilitaryPricingCalculator.calculateTotalArmyValuation(buyer.military);
    const maxValuation = Math.floor(buyerGdp);
    const addedValuation = baseUnitPrice * quantity;

    if (currentValuation + addedValuation > maxValuation) {
      throw new GameError("ARMY_CAP_EXCEEDED");
    }

    const quotas = MilitaryQuotaCalculator.calculateQuotas(
      buyerGdp,
      buyer.military,
    );
    const q = quotas[unitType];

    if (q.remainingRoom < quantity) {
      throw new GameError("QUOTA_REACHED");
    }

    const sellerProfit =
      Math.max(0, marketPricePerUnit - baseUnitPrice) * quantity;

    const updatedBuyerMilitary = MilitaryInventoryHelper.addUnits(
      buyer.military,
      unitType,
      quantity,
      seller.military.techLevel,
    );

    const updatedBuyer: Nation = {
      ...buyer,
      treasury: buyer.treasury - totalCost,
      military: updatedBuyerMilitary,
    };

    const updatedSeller: Nation = {
      ...seller,
      treasury: seller.treasury + sellerProfit,
    };

    const isHumanSeller = GameStateMetricsUtility.isHumanNation(
      state.humanNationId,
      seller.id,
    );

    const logs = [];
    if (isHumanSeller && sellerProfit > 0) {
      logs.push(
        TurnLogBuilder.createNationalLog(
          state.currentTurn,
          seller.id,
          "DOMESTIC",
          "INFO",
          "ARMS_TRADE",
          {
            amount: sellerProfit,
            role: "SELLER",
          },
          buyer.id,
        ),
      );
    }

    const updatedNations = {
      ...state.nations,
      [buyer.id]: updatedBuyer,
      [seller.id]: updatedSeller,
    };

    return {
      ...state,
      nations: updatedNations,
      turnLogs: [...state.turnLogs, ...logs],
    };
  }
}
