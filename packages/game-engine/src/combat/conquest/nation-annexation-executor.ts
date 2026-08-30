import {
  Nation,
  Province,
  CountryRegistry,
  DIPLOMACY_CONFIG,
  NationMutatorUtility,
  NationGettersUtility,
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
    postWarCooldown: number = DIPLOMACY_CONFIG.POST_WAR_COOLDOWN_TURNS,
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
    if (loserObj) {
      updatedNations[loserObj.id] =
        NationMutatorUtility.createDefeatedNation(loserObj);
    }

    const winnerObj =
      updatedNations[winnerCanonical] || updatedNations[winnerId];
    if (winnerObj) {
      const winnerRelations = { ...winnerObj.relations };
      delete winnerRelations[loserCanonical];
      delete winnerRelations[loserId];

      const hasOtherWars = Object.values(winnerRelations).some(
        (r) => r.stance === "WAR",
      );

      updatedNations[winnerObj.id] = {
        ...winnerObj,
        treasury:
          winnerObj.treasury + Math.max(0, loserObj ? loserObj.treasury : 0),
        warFocusTargetId:
          winnerObj.warFocusTargetId === loserCanonical
            ? null
            : winnerObj.warFocusTargetId,
        postWarCooldownTurns:
          winnerObj.isAi && !hasOtherWars ? postWarCooldown : 0,
        relations: winnerRelations,
      };
    }

    return { updatedProvinces, updatedNations };
  }
}
