import { GameState } from "@/domain/game/game-state.schema";
import { BuildFactoryAction } from "@/domain/game/action.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";
import { NationGettersUtility } from "@geopolitics/domain";

export class BuildFactoryExecutor {
  public static execute(
    state: GameState,
    action: BuildFactoryAction,
    nation: Nation,
    buyerKey: string,
  ): GameState {
    const quantity = Math.max(1, action.quantity || 1);
    const totalCost = IndustryCalculator.calculateFactoryBuildCost(
      quantity,
      nation.government?.type,
    );

    if (nation.treasury < totalCost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای احداث این تعداد کارخانه کافی نیست.",
      );
    }

    const canonicalNation = CountryRegistry.resolveCanonicalId(nation.id);
    const ownedProvinces: Province[] = [];

    for (const p of Object.values(state.provinces)) {
      if (
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalNation
      ) {
        ownedProvinces.push(p);
      }
    }

    if (ownedProvinces.length === 0) {
      throw new GameError(
        "PROVINCE_NOT_FOUND",
        "هیچ استانی در قلمرو این کشور یافت نشد.",
      );
    }

    const distribution = new Map<number, number>();

    if (action.provinceId) {
      const prov = state.provinces[action.provinceId.toString()];
      if (!prov) {
        throw new GameError("PROVINCE_NOT_FOUND", "استان مورد نظر یافت نشد.");
      }
      const provOwner = CountryRegistry.resolveCanonicalId(prov.ownerNationId);
      if (provOwner !== canonicalNation) {
        throw new GameError(
          "UNAUTHORIZED",
          "این استان تحت حاکمیت کشور شما قرار ندارد.",
        );
      }
      const emptySlots = Math.max(0, prov.maxSlots - prov.factoriesCount);
      if (emptySlots < quantity) {
        throw new GameError(
          "INVALID_ACTION",
          "اسلات خالی کافی در این استان برای احداث این تعداد کارخانه وجود ندارد.",
        );
      }
      distribution.set(prov.provinceId, quantity);
    } else {
      const calculatedDist = IndustryCalculator.distributeNewFactories(
        ownedProvinces,
        quantity,
      );

      let allocatedCount = 0;
      for (const added of calculatedDist.values()) {
        allocatedCount += added;
      }

      if (allocatedCount < quantity) {
        throw new GameError(
          "INVALID_ACTION",
          "مجموع اسلات‌های خالی در سراسر کشور برای احداث این تعداد کارخانه کافی نیست.",
        );
      }

      for (const [pId, added] of calculatedDist.entries()) {
        distribution.set(pId, added);
      }
    }

    const updatedProvinces: Record<string, Province> = { ...state.provinces };
    for (const [pId, added] of distribution.entries()) {
      const p = updatedProvinces[pId.toString()]!;
      const nextTiers = IndustryCalculator.addFactories(
        p.factoryTiers,
        added,
        nation.industrialLevel,
      );
      updatedProvinces[pId.toString()] = {
        ...p,
        factoriesCount: p.factoriesCount + added,
        factoryTiers: nextTiers,
      };
    }

    const updatedBatches = NationGettersUtility.getNationFactoryTiers(
      nation.id,
      updatedProvinces,
    );
    const newAverageEquipTech = IndustryCalculator.calculateWeightedAverageTech(
      updatedBatches,
      nation.industrialLevel,
    );

    return {
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
  }
}
