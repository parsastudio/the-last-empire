import type { GameState } from "@/domain/game/game-state.schema";
import { SeededRandom } from "@/domain/shared/domain-utilities";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import {
  CoolOffManager,
  ReputationManager,
} from "@/engine/diplomacy/diplomacy-engine";
import { ResourceGenerationStep } from "@/engine/pipeline/economy/resource-generation.step";
import {
  GdpCalculator,
  PopulationGrowthEngine,
  TariffCalculator,
  TaxCalculator,
  MilitaryPayrollCalculator,
  PopulationWelfareCalculator,
  BankruptcyManager,
} from "@/engine/economy/economy-calculators";
import { AutoTradeEngine } from "@/engine/economy/auto-trade/auto-trade.engine";
import { MarketEngine } from "@/engine/economy/market-engine";
import { RecruitmentQueueManager } from "@/engine/military/recruitment-queue";
import { AttritionManager } from "@/engine/military/attrition-manager";
import { CorruptionManager } from "@/engine/politics/corruption-manager";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";
import { ResearchManager } from "@/engine/politics/research-manager";
import { CountryRegistry } from "@/domain/data/countries";
import { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";
import { Nation } from "@/domain/nation/nation.schema";

export class TurnPipeline {
  private coolOffManager = new CoolOffManager();
  private reputationManager = new ReputationManager();
  private popEngine = new PopulationGrowthEngine();
  private bankruptcyManager = new BankruptcyManager();
  private recruitmentQueue = new RecruitmentQueueManager();
  private attritionManager = new AttritionManager();
  private researchManager = new ResearchManager();

  public processTurn(state: GameState, prng: SeededRandom): GameState {
    void prng;
    const marketPrices = MarketEngine.updateMarketPrices();
    const updatedNations: Record<string, Nation> = {};

    const allProvinces = Object.values(state.provinces || {});

    const nationKeys = Object.keys(state.nations);
    for (let i = 0; i < nationKeys.length; i++) {
      const id = nationKeys[i]!;
      const nation = state.nations[id];
      if (!nation) continue;

      const ownedProvinces = allProvinces.filter(
        (p) =>
          p.ownerNationId === id ||
          p.ownerNationId === CountryRegistry.resolveCanonicalId(id),
      );

      const isAlive = ownedProvinces.length > 0;
      if (!isAlive) {
        updatedNations[id] = {
          ...nation,
          isAlive: false,
          gdp: 0,
          population: 0,
          geography: {
            ...nation.geography,
            territoryPixelCount: 0,
          },
        };
        continue;
      }

      const totalProvinceGdp = ownedProvinces.reduce(
        (sum, p) => sum + p.gdp,
        0,
      );
      const totalProvincePop = ownedProvinces.reduce(
        (sum, p) => sum + p.population,
        0,
      );
      const totalProvincePixels = ownedProvinces.reduce(
        (sum, p) => sum + p.pixelCount,
        0,
      );
      const hasSeaAccess = ownedProvinces.some((p) => p.hasSeaAccess);

      let updated: Nation = {
        ...nation,
        isAlive: true,
        gdp: totalProvinceGdp > 0 ? totalProvinceGdp : nation.gdp,
        population: totalProvincePop > 0 ? totalProvincePop : nation.population,
        geography: {
          ...nation.geography,
          territoryPixelCount: totalProvincePixels,
          hasSeaAccess,
        },
      };

      updated = ModifierManager.updateActiveModifiers(updated);

      if (updated.relations) {
        const relKeys = Object.keys(updated.relations);
        let relsChanged = false;
        const newRels: Record<string, RelationProfile> = {
          ...updated.relations,
        };

        for (let j = 0; j < relKeys.length; j++) {
          const targetId = relKeys[j]!;
          const relation = newRels[targetId];
          if (relation && relation.coolOffTurnsRemaining > 0) {
            const nextTurns = this.coolOffManager.processTurnTick(
              relation.coolOffTurnsRemaining,
            );
            let finalStance = relation.stance;
            if (nextTurns === 0 && relation.coolOffTargetStance) {
              finalStance = relation.coolOffTargetStance;
            }
            newRels[targetId] = {
              ...relation,
              coolOffTurnsRemaining: nextTurns,
              stance: finalStance,
            };
            relsChanged = true;
          }
        }
        if (relsChanged) {
          updated = { ...updated, relations: newRels };
        }
      }

      const { oilProducedPerTurn } =
        ResourceGenerationStep.calculateResourceGeneration(updated);

      const updatedGdp = GdpCalculator.updateNationGdp(updated);
      const population = this.popEngine.updatePopulation(updated);

      updated = {
        ...updated,
        gdp: updatedGdp,
        population,
        resources: {
          ...updated.resources,
          oil: updated.resources.oil + oilProducedPerTurn,
        },
      };

      const tariffResult = TariffCalculator.calculateTariffEffects(updated);
      const taxResult = TaxCalculator.evaluateTaxPolicy(updated);

      let addedTreasury = 0;
      if (tariffResult.tariffRevenue > 0)
        addedTreasury += tariffResult.tariffRevenue;
      if (taxResult.taxIncome > 0) addedTreasury += taxResult.taxIncome;

      if (addedTreasury > 0) {
        updated = {
          ...updated,
          treasury: updated.treasury + addedTreasury,
        };
      }

      const autoResult = AutoTradeEngine.processNationAutoTrade(
        updated,
        marketPrices,
      );
      updated = autoResult.updatedNation;

      const payrollBreakdown =
        MilitaryPayrollCalculator.calculatePayroll(updated);
      const totalExpenses =
        payrollBreakdown.total + Math.floor(updated.nationalDebt * 0.05);

      let newTreasury = updated.treasury - totalExpenses;
      let newDebt = updated.nationalDebt;

      if (newTreasury < 0) {
        newDebt += Math.abs(newTreasury);
        newTreasury = 0;
      }
      updated = {
        ...updated,
        treasury: newTreasury,
        nationalDebt: newDebt,
      };

      const welfare = PopulationWelfareCalculator.consumeTurnResources(updated);
      updated = welfare.updatedNation;

      if (this.bankruptcyManager.isBankrupt(updated)) {
        updated = this.bankruptcyManager.applyBankruptcy(updated);
      }

      updated = this.recruitmentQueue.processTurnQueue(updated);
      updated = this.attritionManager.applyMilitaryDeficitAttrition(updated);

      const newCorruption = CorruptionManager.updateCorruptionLevel(updated);
      const newStability = StabilityCalculator.calculateTurnStability(updated);

      updated = {
        ...updated,
        government: {
          ...updated.government,
          corruption: newCorruption,
          stability: newStability,
          turnsInPower: updated.government.turnsInPower + 1,
        },
      };

      updated = this.researchManager.processTurnResearch(updated);
      updated = this.reputationManager.applyReputationGain(updated, 2);

      updatedNations[id] = updated;
    }

    return {
      ...state,
      marketPrices,
      nations: updatedNations,
    };
  }
}
