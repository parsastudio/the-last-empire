import { GameState } from "@/domain/game/game-state.schema";
import { TurnPhase, PipelineContext } from "@/engine/pipeline/turn-phase";
import { ResourceGenerationStep } from "@/engine/pipeline/economy/resource-generation.step";
import { GdpCalculator } from "@/engine/economy/gdp-calculator";
import { PopulationGrowthEngine } from "@/engine/economy/population-growth-engine";
import { ManpowerManager } from "@/engine/economy/manpower-manager";
import { TariffCalculator } from "@/engine/economy/tariff-calculator";
import { AutoTradeEngine } from "@/engine/economy/auto-trade/auto-trade.engine";
import { TaxCalculator } from "@/engine/economy/tax-calculator";
import { MilitaryPayrollCalculator } from "@/engine/economy/military-payroll-calculator";
import { ResourceDependencyManager } from "@/engine/economy/resource-dependency-manager";
import { DebtManager } from "@/engine/economy/debt-manager";
import { BankruptcyManager } from "@/engine/economy/bankruptcy-manager";
import { MarketEngine } from "@/engine/economy/market-engine";

export class EconomyPhase implements TurnPhase {
  private popEngine = new PopulationGrowthEngine();
  private manpowerManager = new ManpowerManager();
  private debtManager = new DebtManager();
  private bankruptcyManager = new BankruptcyManager();
  private marketEngine = new MarketEngine();

  public execute(context: PipelineContext): GameState {
    const nextState = { ...context.state };
    const nations = { ...nextState.nations };
    const marketPrices = nextState.marketPrices;

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      const { oilProducedPerTurn, steelProducedPerTurn } =
        ResourceGenerationStep.calculateResourceGeneration(nation);

      let updated = {
        ...nation,
        resources: {
          ...nation.resources,
          oil: nation.resources.oil + oilProducedPerTurn,
          steel: nation.resources.steel + steelProducedPerTurn,
        },
      };

      const updatedGdp = GdpCalculator.updateNationGdp(updated);
      updated = { ...updated, gdp: updatedGdp };

      const population = this.popEngine.updatePopulation(updated);
      updated = { ...updated, population };

      const manpowerGrowth = this.manpowerManager.calculateGrowth(updated);
      updated = this.manpowerManager.restoreManpower(updated, manpowerGrowth);

      const tariffResult = TariffCalculator.calculateTariffEffects(updated);
      if (tariffResult.tariffRevenue > 0) {
        updated = {
          ...updated,
          treasury: updated.treasury + tariffResult.tariffRevenue,
        };
      }

      const autoResult = AutoTradeEngine.processNationAutoTrade(
        updated,
        marketPrices,
      );
      updated = autoResult.updatedNation;

      const taxResult = TaxCalculator.evaluateTaxPolicy(updated);
      const payrollBreakdown =
        MilitaryPayrollCalculator.calculatePayroll(updated);

      const financial = this.debtManager.processFinancials(
        updated,
        taxResult.taxIncome,
        payrollBreakdown.total,
      );

      updated = financial.updatedNation;
      updated = ResourceDependencyManager.consumeTurnResources(updated);

      if (this.bankruptcyManager.isBankrupt(updated)) {
        updated = this.bankruptcyManager.applyBankruptcy(updated);
      }

      nations[id] = updated;
    }

    nextState.nations = nations;
    nextState.marketPrices = this.marketEngine.updateMarketPrices();
    nextState.turnTradeVolume = {
      oilBought: 0,
      oilSold: 0,
      steelBought: 0,
      steelSold: 0,
    };

    return nextState;
  }
}
