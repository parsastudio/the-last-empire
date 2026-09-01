import {
  Nation,
  Province,
  CountryRegistry,
  NationMutatorUtility,
  NationGettersUtility,
  NationRelationResolver,
  IndustryCalculator,
} from "@geopolitics/domain";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";

export interface AnnexationExecutionResult {
  updatedProvinces: Record<string, Province>;
  updatedNations: Record<string, Nation>;
}

export class NationAnnexationExecutor {
  public static executeTotalAnnexation(
    provinces: Record<string, Province>,
    nations: Record<string, Nation>,
    winnerId: string,
    loserId: string,
    _postWarCooldown?: number,
  ): AnnexationExecutionResult {
    const winnerCanonical = CountryRegistry.resolveCanonicalId(winnerId);
    const loserCanonical = CountryRegistry.resolveCanonicalId(loserId);

    const updatedProvinces: Record<string, Province> = { ...provinces };
    const updatedNations: Record<string, Nation> = { ...nations };

    const loserProvs = NationGettersUtility.getOwnedProvinces(
      loserCanonical,
      updatedProvinces,
    );

    for (let i = 0; i < loserProvs.length; i++) {
      const p = loserProvs[i]!;
      updatedProvinces[p.provinceId.toString()] = {
        ...p,
        ownerNationId: winnerCanonical,
        originalNationId: winnerCanonical,
      };
    }

    BitPackedGridState.getInstance().markDirty();

    const loserObj = updatedNations[loserCanonical] || updatedNations[loserId];
    const winnerObj =
      updatedNations[winnerCanonical] || updatedNations[winnerId];

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

      const mergedFactoryTiers = IndustryCalculator.mergeBatches(
        winnerObj.factoryTiers,
        loserObj.factoryTiers,
      );

      const newEquipmentTech = IndustryCalculator.calculateWeightedAverageTech(
        mergedFactoryTiers,
        winnerObj.industrialLevel,
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
