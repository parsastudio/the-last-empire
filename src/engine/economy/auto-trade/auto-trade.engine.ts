import { Nation } from "@/domain/nation/nation.schema";
import { ResourceMarketPrice } from "@/domain/economy/economy.schema";
import { PopulationWelfareCalculator } from "@/engine/economy/population-welfare-calculator";
import { MARKET_CONFIG } from "@/domain/economy/market.config";

export interface AutoTradeEngineResult {
  updatedNation: Nation;
  oilBought: number;
  oilSold: number;
  loanTakenAmount: number;
}

export class AutoTradeEngine {
  public static processNationAutoTrade(
    nation: Nation,
    marketPrices: ResourceMarketPrice,
  ): AutoTradeEngineResult {
    const config = nation.autoTradeSettings || {
      autoBuyDeficit: false,
      autoSellOilPercent: 0,
      allowEmergencyLoans: true,
    };

    let currentNation = { ...nation };
    let oilBought = 0;
    let oilSold = 0;
    let loanTakenAmount = 0;

    const buyPriceOil = marketPrices.oil || MARKET_CONFIG.FIXED_BUY_PRICE;
    const sellPrice = MARKET_CONFIG.FIXED_SELL_PRICE;

    const oilDemand = PopulationWelfareCalculator.calculateOilDemand(
      currentNation.population,
      currentNation.gdp,
      currentNation.doctrines?.unlockedDoctrines,
      currentNation.industrialLevel,
    );

    const oilSurplus = currentNation.resources.oil - oilDemand;
    if (oilSurplus > 0 && config.autoSellOilPercent > 0) {
      const sellAmount = Math.floor(
        oilSurplus * (config.autoSellOilPercent / 100),
      );
      if (sellAmount > 0) {
        oilSold = sellAmount;
        currentNation = {
          ...currentNation,
          treasury: currentNation.treasury + sellAmount * sellPrice,
          resources: {
            ...currentNation.resources,
            oil: currentNation.resources.oil - sellAmount,
          },
        };
      }
    }

    if (config.autoBuyDeficit) {
      const oilDeficit = Math.max(0, oilDemand - currentNation.resources.oil);

      const neededFunds = oilDeficit * buyPriceOil;

      if (neededFunds > 0) {
        if (
          currentNation.treasury < neededFunds &&
          config.allowEmergencyLoans
        ) {
          const missingCash = neededFunds - currentNation.treasury;
          if (missingCash > 0) {
            loanTakenAmount = missingCash;
            currentNation = {
              ...currentNation,
              treasury: currentNation.treasury + missingCash,
              nationalDebt: currentNation.nationalDebt + missingCash,
            };
          }
        }

        if (oilDeficit > 0) {
          const maxAffordOil = Math.floor(currentNation.treasury / buyPriceOil);
          const actualBuyOil = Math.min(oilDeficit, maxAffordOil);
          if (actualBuyOil > 0) {
            oilBought = actualBuyOil;
            const cost = actualBuyOil * buyPriceOil;
            currentNation = {
              ...currentNation,
              treasury: currentNation.treasury - cost,
              resources: {
                ...currentNation.resources,
                oil: currentNation.resources.oil + actualBuyOil,
              },
            };
          }
        }
      }
    }

    return {
      updatedNation: currentNation,
      oilBought,
      oilSold,
      loanTakenAmount,
    };
  }
}
