import { GameState } from "@/domain/game/game-state.schema";
import { TurnPhase, PipelineContext } from "@/engine/pipeline/turn-phase";
import { ResourceGenerationStep } from "@/engine/pipeline/economy/resource-generation.step";
import {
  GdpCalculator,
  PopulationGrowthEngine,
  ManpowerManager,
  TariffCalculator,
  TaxCalculator,
  MilitaryPayrollCalculator,
  PopulationWelfareCalculator,
  DebtManager,
  BankruptcyManager,
} from "@/engine/economy/economy-calculators";
import { AutoTradeEngine } from "@/engine/economy/auto-trade/auto-trade.engine";
import { MarketEngine } from "@/engine/economy/market-engine";

export class EconomyPhase implements TurnPhase {
  private popEngine = new PopulationGrowthEngine();
  private manpowerManager = new ManpowerManager();
  private debtManager = new DebtManager();
  private bankruptcyManager = new BankruptcyManager();

  public execute(context: PipelineContext): GameState {
    const nextState = { ...context.state };
    const nations = { ...nextState.nations };
    const marketPrices = MarketEngine.updateMarketPrices();

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      const { oilProducedPerTurn } =
        ResourceGenerationStep.calculateResourceGeneration(nation);

      let updated = {
        ...nation,
        resources: {
          ...nation.resources,
          oil: nation.resources.oil + oilProducedPerTurn,
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

      const { updatedNation } =
        PopulationWelfareCalculator.consumeTurnResources(updated);
      updated = updatedNation;

      if (this.bankruptcyManager.isBankrupt(updated)) {
        updated = this.bankruptcyManager.applyBankruptcy(updated);
      }

      nations[id] = updated;
    }

    nextState.nations = nations;
    nextState.marketPrices = marketPrices;

    return nextState;
  }
}
