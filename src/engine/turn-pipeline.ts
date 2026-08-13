import type { GameState } from "@/domain/game/game-state.schema";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import {
  CoolOffManager,
  ReputationManager,
} from "@/engine/diplomacy/diplomacy-engine";
import {
  TariffCalculator,
  TaxCalculator,
  MilitaryPayrollCalculator,
  BankruptcyManager,
} from "@/engine/economy/economy-calculators";
import { DemographicsEngine } from "@/engine/economy/demographics/demographics-engine";
import { MigrationEngine } from "@/engine/economy/demographics/migration-engine";
import { RecruitmentQueueManager } from "@/engine/military/recruitment-queue";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";
import { CountryRegistry } from "@/domain/data/countries";
import { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { RankManager } from "@/engine/politics/rank-manager";

export class TurnPipeline {
  private coolOffManager = new CoolOffManager();
  private reputationManager = new ReputationManager();
  private bankruptcyManager = new BankruptcyManager();
  private recruitmentQueue = new RecruitmentQueueManager();

  public processTurn(state: GameState): GameState {
    const updatedNations: Record<string, Nation> = {};
    const provincesByOwner = new Map<string, Province[]>();

    for (const prov of Object.values(state.provinces || {})) {
      const canonicalOwner = CountryRegistry.resolveCanonicalId(
        prov.ownerNationId,
      );
      let list = provincesByOwner.get(canonicalOwner);
      if (!list) {
        list = [];
        provincesByOwner.set(canonicalOwner, list);
      }
      list.push(prov);
    }

    const nationKeys = Object.keys(state.nations);

    for (let i = 0; i < nationKeys.length; i++) {
      const id = nationKeys[i]!;
      const nation = state.nations[id];
      if (!nation) continue;

      const canonicalId = CountryRegistry.resolveCanonicalId(id);
      const ownedProvinces = provincesByOwner.get(canonicalId) || [];
      const isAlive = ownedProvinces.length > 0;

      if (!isAlive) {
        updatedNations[id] = {
          ...nation,
          isAlive: false,
          population: 0,
          geography: {
            ...nation.geography,
            territoryPixelCount: 0,
            hasSeaAccess: false,
          },
        };
        continue;
      }

      let totalProvincePixels = 0;
      let hasSeaAccess = false;
      for (let pIdx = 0; pIdx < ownedProvinces.length; pIdx++) {
        const p = ownedProvinces[pIdx]!;
        totalProvincePixels += p.pixelCount;
        if (p.hasSeaAccess) {
          hasSeaAccess = true;
        }
      }

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
            newRels[targetId] = {
              ...relation,
              coolOffTurnsRemaining: nextTurns,
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

      const tariffResult = TariffCalculator.calculateTariffEffects(
        updated,
        state.nations,
      );
      const taxResult = TaxCalculator.evaluateTaxPolicy(updated);

      const addedTreasury =
        (tariffResult.tariffRevenue > 0 ? tariffResult.tariffRevenue : 0) +
        (taxResult.taxIncome > 0 ? taxResult.taxIncome : 0);

      const payrollBreakdown =
        MilitaryPayrollCalculator.calculatePayroll(updated);
      const totalExpenses =
        payrollBreakdown.total + Math.floor(updated.nationalDebt * 0.05);

      let newTreasury = updated.treasury + addedTreasury - totalExpenses;
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

      const newStability = StabilityCalculator.calculateTurnStability(
        updated,
        state.nations,
      );

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
    const rankedNations = RankManager.recalculateRanks(
      migrationSummary.updatedNations,
    );

    return {
      ...state,
      nations: rankedNations,
    };
  }
}
