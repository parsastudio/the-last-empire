import { GameState } from "@/domain/game/game-state.schema";
import { BuildFactoryAction } from "@/domain/game/action.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";
import {
  NationGettersUtility,
  MapTopologyRegistry,
  NationalProjectEffectApplierUtility,
} from "@geopolitics/domain";
import { ExecutionResult } from "@/engine/actions/execution-result";

export class BuildFactoryExecutor {
  public static execute(
    state: GameState,
    action: BuildFactoryAction,
    nation: Nation,
    buyerKey: string,
  ): ExecutionResult<{ builtQuantity: number; totalCost: number }> {
    const quantity = Math.max(1, action.quantity || 1);

    const projectDiscount =
      NationalProjectEffectApplierUtility.getCombinedDiscountMultiplier(
        nation.completedProjectIds,
        "procurementCostDiscountMultiplier",
      );

    const baseCost = IndustryCalculator.calculateFactoryBuildCost(
      quantity,
      nation.government?.type,
    );
    const totalCost = Math.floor(baseCost * projectDiscount);

    if (nation.treasury < totalCost) {
      throw new GameError("INSUFFICIENT_FUNDS");
    }

    const canonicalNation = CountryRegistry.resolveCanonicalId(nation.id);
    const ownedProvinces = NationGettersUtility.getOwnedProvinces(
      canonicalNation,
      state.provinces,
    );

    if (ownedProvinces.length === 0) {
      throw new GameError("PROVINCE_NOT_FOUND");
    }

    const slotExpansionRatio =
      NationalProjectEffectApplierUtility.getCombinedBonus(
        nation.completedProjectIds,
        "factorySlotExpansionRatio",
      );

    const getEffectiveMaxSlots = (provinceId: number): number => {
      const baseMax = MapTopologyRegistry.getMaxSlots(provinceId, 1);
      return Math.floor(baseMax * (1.0 + slotExpansionRatio));
    };

    const distribution = new Map<number, number>();

    if (action.provinceId) {
      const prov = state.provinces[action.provinceId.toString()];
      if (!prov) {
        throw new GameError("PROVINCE_NOT_FOUND");
      }
      const provOwner = CountryRegistry.resolveCanonicalId(prov.ownerNationId);
      if (provOwner !== canonicalNation) {
        throw new GameError("UNAUTHORIZED");
      }
      const effectiveMaxSlots = getEffectiveMaxSlots(prov.provinceId);
      const emptySlots = Math.max(0, effectiveMaxSlots - prov.factoriesCount);
      if (emptySlots < quantity) {
        throw new GameError("INSUFFICIENT_SLOTS");
      }
      distribution.set(prov.provinceId, quantity);
    } else {
      const candidateProvinces = ownedProvinces.map((p) => ({
        provinceId: p.provinceId,
        factoriesCount: p.factoriesCount,
        maxSlots: getEffectiveMaxSlots(p.provinceId),
      }));

      const calculatedDist = IndustryCalculator.distributeNewFactories(
        candidateProvinces,
        quantity,
      );

      let allocatedCount = 0;
      for (const added of calculatedDist.values()) {
        allocatedCount += added;
      }

      if (allocatedCount < quantity) {
        throw new GameError("INSUFFICIENT_SLOTS");
      }

      for (const [pId, added] of calculatedDist.entries()) {
        distribution.set(pId, added);
      }
    }

    const updatedProvinces: Record<string, ProvinceDynamicState> = {
      ...state.provinces,
    };
    const updatedOwnedProvinces: ProvinceDynamicState[] = [];

    for (let i = 0; i < ownedProvinces.length; i++) {
      const p = ownedProvinces[i]!;
      const added = distribution.get(p.provinceId) || 0;
      if (added > 0) {
        const nextTiers = IndustryCalculator.addFactories(
          p.factoryTiers,
          added,
          nation.industrialLevel,
        );
        const updatedProv: ProvinceDynamicState = {
          ...p,
          factoriesCount: p.factoriesCount + added,
          factoryTiers: nextTiers,
        };
        updatedProvinces[p.provinceId.toString()] = updatedProv;
        updatedOwnedProvinces.push(updatedProv);
      } else {
        updatedOwnedProvinces.push(p);
      }
    }

    const updatedBatches = NationGettersUtility.getNationFactoryTiers(
      nation.id,
      undefined,
      updatedOwnedProvinces,
    );
    const newAverageEquipTech = IndustryCalculator.calculateWeightedAverageTech(
      updatedBatches,
      nation.industrialLevel,
    );

    const newState: GameState = {
      ...state,
      provinces: updatedProvinces,
      nations: {
        ...state.nations,
        [buyerKey]: {
          ...nation,
          treasury: nation.treasury - totalCost,
          factoryTiers: updatedBatches,
          equipmentTechLevel: newAverageEquipTech,
        },
      },
    };

    return {
      newState,
      resultData: {
        builtQuantity: quantity,
        totalCost,
      },
    };
  }
}
