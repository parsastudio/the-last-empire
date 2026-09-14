import {
  Nation,
  ProvinceDynamicState,
  CountryRegistry,
  NationMutatorUtility,
  NationGettersUtility,
  NationRelationResolver,
  IndustryCalculator,
} from "@geopolitics/domain";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";

export interface AnnexationExecutionResult {
  updatedProvinces: Record<string, ProvinceDynamicState>;
  updatedNations: Record<string, Nation>;
}

export class NationAnnexationExecutor {
  public static executeTotalAnnexation(
    provinces: Record<string, ProvinceDynamicState>,
    nations: Record<string, Nation>,
    winnerId: string,
    loserId: string,
  ): AnnexationExecutionResult {
    const winnerCanonical = CountryRegistry.resolveCanonicalId(winnerId);
    const loserCanonical = CountryRegistry.resolveCanonicalId(loserId);

    const updatedProvinces: Record<string, ProvinceDynamicState> = {
      ...provinces,
    };
    const updatedNations: Record<string, Nation> = { ...nations };

    const winnerObj = NationGettersUtility.resolveNation(
      winnerCanonical,
      updatedNations,
    );
    const loserObj = NationGettersUtility.resolveNation(
      loserCanonical,
      updatedNations,
    );

    const loserProvs = NationGettersUtility.getOwnedProvinces(
      loserCanonical,
      updatedProvinces,
    );

    for (let i = 0; i < loserProvs.length; i++) {
      const p = loserProvs[i]!;
      const flooredTiers = winnerObj
        ? IndustryCalculator.applyIndustrialFloor(
            p.factoryTiers,
            winnerObj.industrialLevel,
          )
        : p.factoryTiers;

      updatedProvinces[p.provinceId.toString()] = {
        provinceId: p.provinceId,
        factoriesCount: p.factoriesCount,
        ownerNationId: winnerCanonical,
        originalNationId: winnerCanonical,
        factoryTiers: flooredTiers,
      };
    }

    BitPackedGridState.getInstance().markDirty();

    if (winnerObj && loserObj) {
      const winnerRelations = { ...winnerObj.relations };
      delete winnerRelations[loserCanonical];
      delete winnerRelations[loserId];

      const postWarCooldown = NationRelationResolver.calculatePostWarCooldown(
        {
          isAi: winnerObj.isAi,
          relations: winnerRelations,
          postWarCooldownTurns: winnerObj.postWarCooldownTurns,
        },
        true,
      );

      let mergedFactoryTiers = IndustryCalculator.mergeBatches(
        winnerObj.factoryTiers,
        loserObj.factoryTiers,
      );

      mergedFactoryTiers = IndustryCalculator.applyIndustrialFloor(
        mergedFactoryTiers,
        winnerObj.industrialLevel,
      );

      const newEquipmentTech = IndustryCalculator.calculateWeightedAverageTech(
        mergedFactoryTiers,
        winnerObj.industrialLevel,
      );

      const nextStability = Math.min(
        100,
        (winnerObj.government?.stability ?? 50) + 6,
      );

      updatedNations[winnerObj.id] = {
        ...winnerObj,
        treasury: winnerObj.treasury + Math.max(0, loserObj.treasury),
        factoryTiers: mergedFactoryTiers,
        equipmentTechLevel: newEquipmentTech,
        warFocusTargetId:
          winnerObj.warFocusTargetId === loserCanonical
            ? null
            : winnerObj.warFocusTargetId,
        postWarCooldownTurns: postWarCooldown,
        relations: winnerRelations,
        government: {
          ...winnerObj.government,
          stability: nextStability,
        },
      };
    }

    if (loserObj) {
      updatedNations[loserObj.id] = {
        ...NationMutatorUtility.createDefeatedNation(loserObj),
        factoryTiers: [],
      };
    }

    return { updatedProvinces, updatedNations };
  }
}
