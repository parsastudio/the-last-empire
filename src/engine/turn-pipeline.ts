import type { GameState } from "@/domain/game/game-state.schema";
import { SeededRandom } from "@/domain/shared/domain-utilities";
import { TurnPhase } from "@/engine/pipeline/turn-phase";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import {
  CoolOffManager,
  PowerScoreRanker,
  ReputationManager,
  DiplomaticOpinionCalculator,
  RelationsManager,
} from "@/engine/diplomacy/diplomacy-engine";
import { ResourceGenerationStep } from "@/engine/pipeline/economy/resource-generation.step";
import {
  GdpCalculator,
  PopulationGrowthEngine,
  ManpowerManager,
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
import { GovernmentSystem } from "@/engine/politics/government-system";
import { CountryRegistry } from "@/domain/data/countries";
import { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";
import { produce } from "immer";

export class TurnPipeline {
  private coolOffManager = new CoolOffManager();
  private powerRanker = new PowerScoreRanker();
  private reputationManager = new ReputationManager();
  private opinionCalculator = new DiplomaticOpinionCalculator();
  private relationsManager = new RelationsManager();
  private popEngine = new PopulationGrowthEngine();
  private manpowerManager = new ManpowerManager();
  private bankruptcyManager = new BankruptcyManager();
  private recruitmentQueue = new RecruitmentQueueManager();
  private attritionManager = new AttritionManager();
  private researchManager = new ResearchManager();

  constructor(phases?: TurnPhase[]) {
    void phases;
  }

  public processTurn(state: GameState, prng: SeededRandom): GameState {
    void prng;
    return produce(state, (draft) => {
      const marketPrices = MarketEngine.updateMarketPrices();
      draft.marketPrices = marketPrices;

      const nations = draft.nations;
      const rawNationsList: Array<{
        id: string;
        gdp: number;
        treasury: number;
        infantry: number;
        airForce: number;
        drone: number;
        techLevel: number;
        militaryPowerMultiplier: number;
      }> = [];

      for (const [id, nation] of Object.entries(nations)) {
        if (!nation || !nation.isAlive) {
          continue;
        }

        let updated = ModifierManager.updateActiveModifiers(nation);

        const updatedRelations: Record<string, RelationProfile> = {
          ...(updated.relations || {}),
        };
        for (const [targetId, relation] of Object.entries(updatedRelations)) {
          let currentRel = relation;
          if (currentRel.coolOffTurnsRemaining > 0) {
            const nextTurns = this.coolOffManager.processTurnTick(
              currentRel.coolOffTurnsRemaining,
            );
            let finalStance = currentRel.stance;
            if (nextTurns === 0 && currentRel.coolOffTargetStance) {
              finalStance = currentRel.coolOffTargetStance;
            }
            currentRel = {
              ...currentRel,
              coolOffTurnsRemaining: nextTurns,
              stance: finalStance,
            };
          }
          updatedRelations[targetId] = currentRel;
        }
        updated.relations = updatedRelations;

        const { oilProducedPerTurn } =
          ResourceGenerationStep.calculateResourceGeneration(updated);
        updated.resources.oil += oilProducedPerTurn;

        const updatedGdp = GdpCalculator.updateNationGdp(updated);
        updated.gdp = updatedGdp;

        const population = this.popEngine.updatePopulation(updated);
        updated.population = population;

        const manpowerGrowth = this.manpowerManager.calculateGrowth(updated);
        updated = this.manpowerManager.restoreManpower(updated, manpowerGrowth);

        const tariffResult = TariffCalculator.calculateTariffEffects(updated);
        if (tariffResult.tariffRevenue > 0) {
          updated.treasury += tariffResult.tariffRevenue;
        }

        const taxResult = TaxCalculator.evaluateTaxPolicy(updated);
        if (taxResult.taxIncome > 0) {
          updated.treasury += taxResult.taxIncome;
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
        updated.treasury = newTreasury;
        updated.nationalDebt = newDebt;

        const welfare =
          PopulationWelfareCalculator.consumeTurnResources(updated);
        updated = welfare.updatedNation;

        if (this.bankruptcyManager.isBankrupt(updated)) {
          updated = this.bankruptcyManager.applyBankruptcy(updated);
        }

        updated = this.recruitmentQueue.processTurnQueue(updated);
        updated = this.attritionManager.applyMilitaryDeficitAttrition(updated);

        updated.government.corruption =
          CorruptionManager.updateCorruptionLevel(updated);
        updated.government.stability =
          StabilityCalculator.calculateTurnStability(updated);
        updated = this.researchManager.processTurnResearch(updated);
        updated.government.turnsInPower += 1;

        updated = this.reputationManager.applyReputationGain(updated, 2);

        nations[id] = updated;

        const govTraits = GovernmentSystem.getTraits(updated.government.type);
        rawNationsList.push({
          id: updated.id,
          gdp: updated.gdp,
          treasury: updated.treasury,
          infantry: updated.military.infantry,
          airForce: updated.military.airForce,
          drone: updated.military.droneMissile,
          techLevel: updated.military.techLevel,
          militaryPowerMultiplier: govTraits.militaryPowerMultiplier,
        });
      }

      const ranked = this.powerRanker.rankNations(rawNationsList);
      for (const r of ranked) {
        if (nations[r.id]) {
          nations[r.id]!.rank = r.rank;
        }
      }

      for (const [id, nation] of Object.entries(nations)) {
        void id;
        if (!nation || !nation.isAlive) {
          continue;
        }
        const updatedRelations = { ...(nation.relations || {}) };
        for (const [targetId, relation] of Object.entries(updatedRelations)) {
          if (!relation) continue;
          const canonicalTargetId =
            CountryRegistry.resolveCanonicalId(targetId);
          const target = nations[targetId] || nations[canonicalTargetId];
          if (target && target.isAlive) {
            const landNeighbors = nation.geography?.landNeighbors || [];
            const isLandNeighbor =
              landNeighbors.includes(targetId) ||
              landNeighbors.includes(canonicalTargetId);
            const frictionValue =
              this.relationsManager.calculateGovernmentFriction(nation, target);
            const nextOpinion = this.opinionCalculator.calculateOpinion(
              relation.opinion,
              nation.globalReputation,
              relation.stance,
              isLandNeighbor,
              frictionValue,
            );
            updatedRelations[targetId] = {
              ...relation,
              opinion: nextOpinion,
            };
          }
        }
        nation.relations = updatedRelations;
      }
    });
  }
}
