import type { GameState } from "@/domain/game/game-state.schema";
import { GdpCalculator } from "@/engine/economy/gdp-calculator";
import { UpkeepCalculator } from "@/engine/economy/upkeep-calculator";
import { TaxCalculator } from "@/engine/economy/tax-calculator";
import { DebtManager } from "@/engine/economy/debt-manager";
import { BankruptcyManager } from "@/engine/economy/bankruptcy-manager";
import { PopulationGrowthEngine } from "@/engine/economy/population-growth-engine";
import { ManpowerManager } from "@/engine/economy/manpower-manager";
import { TariffCalculator } from "@/engine/economy/tariff-calculator";
import { TradeRouteManager } from "@/engine/economy/trade-route-manager";
import { OverextensionCalculator } from "@/engine/economy/overextension-calculator";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import { TributeManager } from "@/engine/diplomacy/tribute-manager";
import { MarketEngine } from "@/engine/economy/market-engine";
import { ResourceDependencyManager } from "@/engine/economy/resource-dependency-manager";
import { TurnPhase, PipelineContext } from "@/engine/pipeline/turn-phase";

export interface EconomyCalculators {
  gdpCalc: GdpCalculator;
  upkeepCalc: UpkeepCalculator;
  taxCalc: TaxCalculator;
  debtManager: DebtManager;
  bankruptcyManager: BankruptcyManager;
  popEngine: PopulationGrowthEngine;
  manpowerManager: ManpowerManager;
  tariffCalculator: TariffCalculator;
  tradeRouteManager: TradeRouteManager;
}

export class EconomyPhase implements TurnPhase {
  private calcs: EconomyCalculators;
  private overextensionCalculator = new OverextensionCalculator();
  private doctrinesManager = new DoctrinesManager();
  private tributeManager = new TributeManager();
  private marketEngine = new MarketEngine();
  private resourceDependencyManager = new ResourceDependencyManager();

  constructor(calcs?: EconomyCalculators) {
    this.calcs = calcs ?? {
      gdpCalc: new GdpCalculator(),
      upkeepCalc: new UpkeepCalculator(),
      taxCalc: new TaxCalculator(),
      debtManager: new DebtManager(),
      bankruptcyManager: new BankruptcyManager(),
      popEngine: new PopulationGrowthEngine(),
      manpowerManager: new ManpowerManager(),
      tariffCalculator: new TariffCalculator(),
      tradeRouteManager: new TradeRouteManager(),
    };
  }

  public execute(context: PipelineContext): GameState {
    const nextState = { ...context.state };
    const nations = { ...nextState.nations };

    const tradeVolume = nextState.turnTradeVolume ?? {
      oilBought: 0,
      oilSold: 0,
      steelBought: 0,
      steelSold: 0,
    };

    let totalOilDemand = tradeVolume.oilBought;
    const totalOilSupply = tradeVolume.oilSold;
    let totalSteelDemand = tradeVolume.steelBought;
    const totalSteelSupply = tradeVolume.steelSold;

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      let updated = { ...nation };

      const isMartialLawActive = updated.activeModifiers.some(
        (m) => m.id === "martial-law-active",
      );
      if (isMartialLawActive) {
        updated.warExhaustion = Math.min(100, updated.warExhaustion + 5);
      }

      updated.adminBurdenMultiplier =
        this.overextensionCalculator.calculateOverextension(updated);

      const resourceIncomeFactor = Math.floor(
        updated.geography.territorySize / 1000,
      );
      if (resourceIncomeFactor > 0) {
        updated.resources = {
          ...updated.resources,
          oil: updated.resources.oil + resourceIncomeFactor * 5,
          steel: updated.resources.steel + resourceIncomeFactor * 5,
        };
      }

      const oilDemand = Math.ceil(
        (updated.military.airForce + updated.military.droneMissile) * 0.5,
      );
      totalOilDemand += oilDemand;

      const steelDemand = updated.industrialLevel * 2;
      totalSteelDemand += steelDemand;

      const peacefulNeighbors = updated.geography.landNeighbors.filter(
        (nId) => {
          const rel = updated.relations[nId];
          return !rel || rel.stance !== "WAR";
        },
      ).length;

      const rawGdp = this.calcs.gdpCalc.updateNationGdp(
        updated,
        peacefulNeighbors,
      );
      const doctrineGdpBonus = this.doctrinesManager.getGdpGrowthModifier(
        updated.doctrines.unlockedDoctrines,
      );
      updated.gdp = Math.floor(rawGdp * (1.0 + doctrineGdpBonus));

      const activeWar = Object.values(updated.relations).some(
        (r) => r.stance === "WAR",
      );
      updated.population = this.calcs.popEngine.updatePopulation(
        updated,
        activeWar,
      );

      const density =
        updated.population / (updated.geography.territorySize || 1);
      if (density > 1500) {
        updated.government = {
          ...updated.government,
          stability: Math.max(0, updated.government.stability - 2),
        };
      }

      const growth = this.calcs.manpowerManager.calculateGrowth(updated);
      updated = this.calcs.manpowerManager.restoreManpower(updated, growth);

      const taxResult = this.calcs.taxCalc.evaluateTaxPolicy(updated);
      const rawUpkeep = this.calcs.upkeepCalc.calculateUpkeep(updated);

      let upkeepTotal = rawUpkeep.total;
      upkeepTotal = this.resourceDependencyManager.applyOilScarcityPenalty(
        updated,
        upkeepTotal,
      );

      const doctrineUpkeepDiscount = this.doctrinesManager.getUpkeepMultiplier(
        updated.doctrines.unlockedDoctrines,
      );
      const finalUpkeepTotal = Math.floor(upkeepTotal * doctrineUpkeepDiscount);

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
        finalUpkeepTotal,
      );

      updated = financial.updatedNation;
      updated = this.resourceDependencyManager.consumeTurnResources(updated);

      const hasReachedDebtLimit =
        this.calcs.bankruptcyManager.hasReachedDebtLimit(updated);
      const isDeficitIncurred = financial.netIncome < 0;

      if (hasReachedDebtLimit && isDeficitIncurred && updated.treasury <= 0) {
        updated.consecutiveDeficitTurns += 1;
      } else {
        updated.consecutiveDeficitTurns = 0;
      }

      if (updated.consecutiveDeficitTurns >= 3) {
        const disintegrationResult =
          this.calcs.bankruptcyManager.applyDisintegration(updated, nations);
        updated = disintegrationResult.updatedNation;
        for (const [neighId, neighNation] of Object.entries(
          disintegrationResult.updatedAllNations,
        )) {
          nations[neighId] = neighNation;
        }
      }

      if (this.calcs.bankruptcyManager.isBankrupt(updated)) {
        updated = this.calcs.bankruptcyManager.applyBankruptcy(updated);
      }

      nations[id] = updated;
    }

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }
      for (const [targetId, relation] of Object.entries(nation.relations)) {
        if (relation.tributePerTurn > 0) {
          const targetNation = nations[targetId];
          if (targetNation && targetNation.isAlive) {
            const result = this.tributeManager.processTurnTributes(
              nations[id],
              nations[targetId],
            );
            nations[id] = result.nation;
            nations[targetId] = result.targetNation;
          }
        }
      }
    }

    nextState.marketPrices = this.marketEngine.updateMarketPrices(
      nextState.marketPrices,
      totalOilDemand,
      totalOilSupply,
      totalSteelDemand,
      totalSteelSupply,
    );

    nextState.turnTradeVolume = {
      oilBought: 0,
      oilSold: 0,
      steelBought: 0,
      steelSold: 0,
    };

    nextState.nations = nations;
    return nextState;
  }
}
