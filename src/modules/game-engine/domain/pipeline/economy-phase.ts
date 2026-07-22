import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import { GdpCalculator } from "@/modules/economy/domain/gdp-calculator";
import { UpkeepCalculator } from "@/modules/economy/domain/upkeep-calculator";
import { TaxCalculator } from "@/modules/economy/domain/tax-calculator";
import { DebtManager } from "@/modules/economy/domain/debt-manager";
import { BankruptcyManager } from "@/modules/economy/domain/bankruptcy-manager";
import { InflationCalculator } from "@/modules/economy/domain/inflation-calculator";
import { PopulationGrowthEngine } from "@/modules/economy/domain/population-growth-engine";
import { ManpowerManager } from "@/modules/economy/domain/manpower-manager";
import { TariffCalculator } from "@/modules/trade/domain/tariff-calculator";
import { TradeRouteManager } from "@/modules/trade/domain/trade-route-manager";
import { TurnPhase, PipelineContext } from "./turn-phase";

export interface EconomyCalculators {
  gdpCalc: GdpCalculator;
  upkeepCalc: UpkeepCalculator;
  taxCalc: TaxCalculator;
  debtManager: DebtManager;
  bankruptcyManager: BankruptcyManager;
  inflationCalc: InflationCalculator;
  popEngine: PopulationGrowthEngine;
  manpowerManager: ManpowerManager;
  tariffCalculator: TariffCalculator;
  tradeRouteManager: TradeRouteManager;
}

export class EconomyPhase implements TurnPhase {
  private calcs: EconomyCalculators;

  constructor(calcs?: EconomyCalculators) {
    this.calcs = calcs ?? {
      gdpCalc: new GdpCalculator(),
      upkeepCalc: new UpkeepCalculator(),
      taxCalc: new TaxCalculator(),
      debtManager: new DebtManager(),
      bankruptcyManager: new BankruptcyManager(),
      inflationCalc: new InflationCalculator(),
      popEngine: new PopulationGrowthEngine(),
      manpowerManager: new ManpowerManager(),
      tariffCalculator: new TariffCalculator(),
      tradeRouteManager: new TradeRouteManager(),
    };
  }

  public execute(context: PipelineContext): GameState {
    const nextState = { ...context.state };
    const nations = { ...nextState.nations };

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      let updated = { ...nation };

      const peacefulNeighbors = updated.geography.landNeighbors.filter(
        (nId) => {
          const rel = updated.relations[nId];
          return !rel || rel.stance !== "WAR";
        },
      ).length;

      updated.gdp = this.calcs.gdpCalc.updateNationGdp(
        updated,
        peacefulNeighbors,
      );
      updated.population = this.calcs.popEngine.updatePopulation(
        updated,
        false,
      );

      const growth = this.calcs.manpowerManager.calculateGrowth(updated);
      updated = this.calcs.manpowerManager.restoreManpower(updated, growth);

      const taxResult = this.calcs.taxCalc.evaluateTaxPolicy(updated);
      const upkeepResult = this.calcs.upkeepCalc.calculateUpkeep(updated);

      const totalTradeValue =
        this.calcs.tradeRouteManager.calculateTotalTradeRevenue(
          updated,
          nations,
        );
      const tariffResult = this.calcs.tariffCalculator.calculateTariffEffects(
        updated,
        totalTradeValue,
      );

      const financial = this.calcs.debtManager.processFinancials(
        updated,
        taxResult.taxIncome + tariffResult.tariffRevenue,
        upkeepResult.total,
      );

      updated = financial.updatedNation;
      updated.inflation =
        this.calcs.inflationCalc.calculateNextInflation(updated);

      if (this.calcs.bankruptcyManager.isBankrupt(updated)) {
        updated = this.calcs.bankruptcyManager.applyBankruptcy(updated);
      }

      nations[id] = updated;
    }

    nextState.nations = nations;
    return nextState;
  }
}
