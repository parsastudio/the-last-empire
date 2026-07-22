import type { GameState } from "@/core/types/game-state.types";
import { deepClone } from "@/core/utils/deep-clone";
import { GdpCalculator } from "@/modules/economy/domain/gdp-calculator";
import { UpkeepCalculator } from "@/modules/economy/domain/upkeep-calculator";
import { TaxCalculator } from "@/modules/economy/domain/tax-calculator";
import { DebtManager } from "@/modules/economy/domain/debt-manager";
import { BankruptcyManager } from "@/modules/economy/domain/bankruptcy-manager";
import { InflationCalculator } from "@/modules/economy/domain/inflation-calculator";
import { PopulationGrowthEngine } from "@/modules/economy/domain/population-growth-engine";
import { ManpowerManager } from "@/modules/economy/domain/manpower-manager";
import { RecruitmentQueueManager } from "@/modules/military/domain/recruitment-queue";
import { AttritionManager } from "@/modules/military/domain/attrition-manager";
import { StabilityCalculator } from "@/modules/politics/domain/stability-calculator";
import { CorruptionManager } from "@/modules/politics/domain/corruption-manager";
import { RebellionEngine } from "@/modules/politics/domain/rebellion-engine";
import { MilitaryCoupEngine } from "@/modules/politics/domain/military-coup-engine";
import { ElectionEngine } from "@/modules/politics/domain/election-engine";
import { ModifierManager } from "@/modules/events/domain/modifier-manager";
import { EventEvaluator } from "@/modules/events/domain/event-evaluator";
import { TariffCalculator } from "@/modules/trade/domain/tariff-calculator";
import { TraitManager } from "@/modules/nation/domain/trait-manager";

export class TurnPipeline {
  private gdpCalc = new GdpCalculator();
  private upkeepCalc = new UpkeepCalculator();
  private taxCalc = new TaxCalculator();
  private debtManager = new DebtManager();
  private bankruptcyManager = new BankruptcyManager();
  private inflationCalc = new InflationCalculator();
  private popEngine = new PopulationGrowthEngine();
  private manpowerManager = new ManpowerManager();
  private recruitmentQueue = new RecruitmentQueueManager();
  private attritionManager = new AttritionManager();
  private stabilityCalc = new StabilityCalculator();
  private corruptionManager = new CorruptionManager();
  private rebellionEngine = new RebellionEngine();
  private coupEngine = new MilitaryCoupEngine();
  private electionEngine = new ElectionEngine();
  private modifierManager = new ModifierManager();
  private eventEvaluator = new EventEvaluator();
  private tariffCalculator = new TariffCalculator();
  private traitManager = new TraitManager();

  public processTurn(state: GameState): GameState {
    const nextState = deepClone(state);

    for (const [id, nation] of Object.entries(nextState.nations)) {
      if (!nation.isAlive) {
        continue;
      }

      let updated = { ...nation };

      updated = this.modifierManager.updateActiveModifiers(updated);

      const peacefulNeighbors = updated.geography.landNeighbors.filter(
        (nId) => {
          const rel = updated.relations[nId];
          return !rel || rel.stance !== "WAR";
        },
      ).length;

      const baseGdp = this.gdpCalc.updateNationGdp(updated, peacefulNeighbors);
      updated.gdp = baseGdp;

      const population = this.popEngine.updatePopulation(updated, false);
      updated.population = population;

      const growth = this.manpowerManager.calculateGrowth(updated);
      updated = this.manpowerManager.restoreManpower(updated, growth);

      const corruption = this.corruptionManager.updateCorruptionLevel(updated);
      updated.government.corruption = corruption;

      const taxResult = this.taxCalc.evaluateTaxPolicy(updated);
      const upkeepResult = this.upkeepCalc.calculateUpkeep(updated);

      const totalTradeValue = peacefulNeighbors * 5000;
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

      const inflation = this.inflationCalc.calculateNextInflation(updated);
      updated.inflation = inflation;

      if (this.bankruptcyManager.isBankrupt(updated)) {
        updated = this.bankruptcyManager.applyBankruptcy(updated);
      }

      updated = this.recruitmentQueue.processTurnQueue(updated);
      updated = this.attritionManager.applyUpkeepDeficitAttrition(updated);

      let stability = this.stabilityCalc.calculateTurnStability(updated);
      stability = Math.max(
        0,
        Math.min(
          100,
          stability + this.traitManager.getBaseStabilityDelta(updated),
        ),
      );
      updated.government.stability = stability;

      const electionResult = this.electionEngine.processElection(
        updated,
        nextState.currentTurn,
        nextState.seed,
      );
      if (electionResult.electionHeld) {
        updated = electionResult.updatedNation;
      }

      const rebellionResult =
        this.rebellionEngine.checkAndTriggerRebellion(updated);
      if (rebellionResult.hasRebellionTriggered) {
        updated = rebellionResult.updatedNation;
      }

      const coupResult = this.coupEngine.checkAndExecuteCoup(updated);
      if (coupResult.hasCoupOccurred) {
        updated = coupResult.updatedNation;
      }

      updated.government.turnsInPower += 1;
      nextState.nations[id] = updated;
    }

    this.eventEvaluator.evaluateTurnEvents(nextState);

    return nextState;
  }
}
