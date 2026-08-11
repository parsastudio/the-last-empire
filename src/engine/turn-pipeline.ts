import type { GameState } from "@/domain/game/game-state.schema";
import { SeededRandom } from "@/domain/shared/domain-utilities";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import {
  CoolOffManager,
  ReputationManager,
} from "@/engine/diplomacy/diplomacy-engine";
import {
  GdpCalculator,
  TariffCalculator,
  TaxCalculator,
  MilitaryPayrollCalculator,
  BankruptcyManager,
} from "@/engine/economy/economy-calculators";
import { DemographicsEngine } from "@/engine/economy/demographics/demographics-engine";
import { MigrationEngine } from "@/engine/economy/demographics/migration-engine";
import { RecruitmentQueueManager } from "@/engine/military/recruitment-queue";
import { AttritionManager } from "@/engine/military/attrition-manager";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";
import { CountryRegistry } from "@/domain/data/countries";
import { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";
import { Nation } from "@/domain/nation/nation.schema";

export class TurnPipeline {
  private coolOffManager = new CoolOffManager();
  private reputationManager = new ReputationManager();
  private bankruptcyManager = new BankruptcyManager();
  private recruitmentQueue = new RecruitmentQueueManager();
  private attritionManager = new AttritionManager();

  public processTurn(state: GameState, prng: SeededRandom): GameState {
    void prng;
    let updatedNations: Record<string, Nation> = {};
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

      const totalProvincePixels = ownedProvinces.reduce(
        (sum, p) => sum + p.pixelCount,
        0,
      );
      const hasSeaAccess = ownedProvinces.some((p) => p.hasSeaAccess);

      let updated: Nation = {
        ...nation,
        isAlive: true,
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

      const demoResult = DemographicsEngine.processNaturalDemographics(updated);
      updated = demoResult.updatedNation;

      const prodResult = GdpCalculator.updateProductivityAndGdp(updated);
      updated = GdpCalculator.syncNationGdpAndDemographics(
        updated,
        updated.population,
        prodResult.nextProductivity,
      );

      const tariffResult = TariffCalculator.calculateTariffEffects(
        updated,
        state.nations,
      );
      const taxResult = TaxCalculator.evaluateTaxPolicy(updated);

      let addedTreasury = 0;
      if (tariffResult.tariffRevenue > 0) {
        addedTreasury += tariffResult.tariffRevenue;
      }
      if (taxResult.taxIncome > 0) {
        addedTreasury += taxResult.taxIncome;
      }

      if (addedTreasury > 0) {
        updated = {
          ...updated,
          treasury: updated.treasury + addedTreasury,
        };
      }

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

      if (this.bankruptcyManager.isBankrupt(updated)) {
        updated = this.bankruptcyManager.applyBankruptcy(updated);
      }

      updated = this.recruitmentQueue.processTurnQueue(updated);
      updated = this.attritionManager.applyMilitaryDeficitAttrition(updated);

      const newStability = StabilityCalculator.calculateTurnStability(updated);

      updated = {
        ...updated,
        government: {
          ...updated.government,
          stability: newStability,
          turnsInPower: updated.government.turnsInPower + 1,
        },
      };

      updated = this.reputationManager.applyReputationGain(updated, 2);

      updatedNations[id] = updated;
    }

    const migrationSummary =
      MigrationEngine.processGlobalMigration(updatedNations);
    updatedNations = migrationSummary.updatedNations;

    return {
      ...state,
      nations: updatedNations,
    };
  }
}
