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
import { TurnPhase } from "./turn-phase";

export class EconomyPhase implements TurnPhase {
  private gdpCalc = new GdpCalculator();
  private upkeepCalc = new UpkeepCalculator();
  private taxCalc = new TaxCalculator();
  private debtManager = new DebtManager();
  private bankruptcyManager = new BankruptcyManager();
  private inflationCalc = new InflationCalculator();
  private popEngine = new PopulationGrowthEngine();
  private manpowerManager = new ManpowerManager();
  private tariffCalculator = new TariffCalculator();
  private tradeRouteManager = new TradeRouteManager();

  public execute(state: GameState): GameState {
    const nextState = { ...state };
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

      updated.gdp = this.gdpCalc.updateNationGdp(updated, peacefulNeighbors);
      updated.population = this.popEngine.updatePopulation(updated, false);

      const growth = this.manpowerManager.calculateGrowth(updated);
      updated = this.manpowerManager.restoreManpower(updated, growth);

      const taxResult = this.taxCalc.evaluateTaxPolicy(updated);
      const upkeepResult = this.upkeepCalc.calculateUpkeep(updated);

      const totalTradeValue = this.tradeRouteManager.calculateTotalTradeRevenue(
        updated,
        nations,
      );
      const tariffResult = this.tariffCalculator.calculateTariffEffects(
        updated,
        totalTradeValue,
      );

      const financial = this.debtManager.processFinancials(
        updated,
        taxResult.taxIncome + tariffResult.tariffRevenue,
        upkeepResult.total,
      );

      updated = financial.updatedNation;
      updated.inflation = this.inflationCalc.calculateNextInflation(updated);

      if (this.bankruptcyManager.isBankrupt(updated)) {
        updated = this.bankruptcyManager.applyBankruptcy(updated);
      }

      nations[id] = updated;
    }

    nextState.nations = nations;
    return nextState;
  }
}
