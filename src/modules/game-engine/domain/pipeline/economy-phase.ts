import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import { GdpCalculator } from "@/modules/economy/domain/gdp-calculator";
import { UpkeepCalculator } from "@/modules/economy/domain/upkeep-calculator";
import { TaxCalculator } from "@/modules/economy/domain/tax-calculator";
import { DebtManager } from "@/modules/economy/domain/debt-manager";
import { BankruptcyManager } from "@/modules/economy/domain/bankruptcy-manager";
import { PopulationGrowthEngine } from "@/modules/economy/domain/population-growth-engine";
import { ManpowerManager } from "@/modules/economy/domain/manpower-manager";
import { TariffCalculator } from "@/modules/trade/domain/tariff-calculator";
import { TradeRouteManager } from "@/modules/trade/domain/trade-route-manager";
import { OverextensionCalculator } from "@/modules/economy/domain/overextension-calculator";
import { DoctrinesManager } from "@/modules/politics/domain/doctrines-manager";
import { TributeManager } from "@/modules/diplomacy/domain/tribute-manager";
import { TurnPhase, PipelineContext } from "./turn-phase";

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
      const doctrineUpkeepDiscount = this.doctrinesManager.getUpkeepMultiplier(
        updated.doctrines.unlockedDoctrines,
      );
      const finalUpkeepTotal = Math.floor(
        rawUpkeep.total * doctrineUpkeepDiscount,
      );

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

      const hasReachedDebtLimit =
        this.calcs.bankruptcyManager.isBankrupt(updated);
      const isDeficitIncurred = financial.netIncome < 0;

      if (hasReachedDebtLimit && isDeficitIncurred && updated.treasury <= 0) {
        updated.consecutiveDeficitTurns += 1;
      } else {
        updated.consecutiveDeficitTurns = 0;
      }

      if (updated.consecutiveDeficitTurns >= 3) {
        updated = this.calcs.bankruptcyManager.applyDisintegration(updated);
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
              nation,
              targetNation,
            );
            nations[id] = result.nation;
            nations[targetId] = result.targetNation;
          }
        }
      }
    }

    nextState.nations = nations;
    return nextState;
  }
}
