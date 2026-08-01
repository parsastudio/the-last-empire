import { Nation } from "@/domain/nation/nation.schema";
import { ResourceMarketPrice } from "@/domain/economy/economy.schema";
import { PopulationWelfareCalculator } from "@/engine/economy/population-welfare-calculator";

export interface AutoTradeEngineResult {
  updatedNation: Nation;
  oilBought: number;
  steelBought: number;
  oilSold: number;
  steelSold: number;
  loanTakenAmount: number;
}

export class AutoTradeEngine {
  private popWelfareCalc = new PopulationWelfareCalculator();

  public processNationAutoTrade(
    nation: Nation,
    marketPrices: ResourceMarketPrice,
  ): AutoTradeEngineResult {
    const config = nation.autoTradeSettings || {
      autoBuyDeficit: false,
      autoSellOilPercent: 0,
      autoSellSteelPercent: 0,
      allowEmergencyLoans: true,
      maxDebtRatioLimit: 0.8,
    };

    let currentNation = { ...nation };
    let oilBought = 0;
    let steelBought = 0;
    let oilSold = 0;
    let steelSold = 0;
    let loanTakenAmount = 0;

    const buyPriceOil = marketPrices.oil || 25000000;
    const buyPriceSteel = marketPrices.steel || 25000000;
    const sellPrice = 20000000;

    const oilDemand = this.popWelfareCalc.calculateOilDemand(
      currentNation.population,
      currentNation.gdp,
      currentNation.doctrines?.unlockedDoctrines,
    );
    const steelDemand = this.popWelfareCalc.calculateSteelDemand(
      currentNation.population,
      currentNation.gdp,
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

    const steelSurplus = currentNation.resources.steel - steelDemand;
    if (steelSurplus > 0 && config.autoSellSteelPercent > 0) {
      const sellAmount = Math.floor(
        steelSurplus * (config.autoSellSteelPercent / 100),
      );
      if (sellAmount > 0) {
        steelSold = sellAmount;
        currentNation = {
          ...currentNation,
          treasury: currentNation.treasury + sellAmount * sellPrice,
          resources: {
            ...currentNation.resources,
            steel: currentNation.resources.steel - sellAmount,
          },
        };
      }
    }

    if (config.autoBuyDeficit) {
      const oilDeficit = Math.max(0, oilDemand - currentNation.resources.oil);
      const steelDeficit = Math.max(
        0,
        steelDemand - currentNation.resources.steel,
      );

      const neededFunds =
        oilDeficit * buyPriceOil + steelDeficit * buyPriceSteel;

      if (neededFunds > 0) {
        if (
          currentNation.treasury < neededFunds &&
          config.allowEmergencyLoans
        ) {
          const currentDebtRatio =
            currentNation.gdp > 0
              ? currentNation.nationalDebt / currentNation.gdp
              : 1;

          if (currentDebtRatio < config.maxDebtRatioLimit) {
            const missingCash = neededFunds - currentNation.treasury;
            const loanAmount = Math.ceil(missingCash / 1e9) * 1e9;

            loanTakenAmount = loanAmount;
            const totalDebtAdded = loanAmount + Math.floor(loanAmount * 0.05);

            currentNation = {
              ...currentNation,
              treasury: currentNation.treasury + loanAmount,
              nationalDebt: currentNation.nationalDebt + totalDebtAdded,
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

        if (steelDeficit > 0) {
          const maxAffordSteel = Math.floor(
            currentNation.treasury / buyPriceSteel,
          );
          const actualBuySteel = Math.min(steelDeficit, maxAffordSteel);
          if (actualBuySteel > 0) {
            steelBought = actualBuySteel;
            const cost = actualBuySteel * buyPriceSteel;
            currentNation = {
              ...currentNation,
              treasury: currentNation.treasury - cost,
              resources: {
                ...currentNation.resources,
                steel: currentNation.resources.steel + actualBuySteel,
              },
            };
          }
        }
      }
    }

    return {
      updatedNation: currentNation,
      oilBought,
      steelBought,
      oilSold,
      steelSold,
      loanTakenAmount,
    };
  }
}
