import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  CountryRegistry,
  LandNeighborResolver,
  NationGettersUtility,
} from "@geopolitics/domain";
import { AttackDeploymentOptimizer } from "@/engine/combat/attack-deployment-optimizer";

export class AIAttackPlanner {
  public static planAttack(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    ownedProvinces?: Province[],
    currentTurn?: number,
  ): GameAction | null {
    if (!nation.isAlive || !nation.relations || !provincesMap) {
      return null;
    }

    const targetNation = this.resolveActiveWarTarget(
      nation,
      allNations,
      currentTurn,
    );
    if (!targetNation || !targetNation.isAlive) {
      return null;
    }

    const availableInfantry = nation.military.infantry || 0;
    if (availableInfantry < 1) {
      return null;
    }

    const targetResolution = this.resolveTargetProvince(
      nation,
      targetNation,
      provincesMap,
      ownedProvinces,
    );

    if (!targetResolution) {
      return null;
    }

    const guarantorNation = targetNation.securityGuarantorId
      ? NationGettersUtility.resolveNation(
          targetNation.securityGuarantorId,
          allNations,
        )
      : null;

    const fleetCount = nation.navalFleet || 0;

    const optimalDeployment =
      AttackDeploymentOptimizer.calculateOptimalDeployment(
        nation,
        targetNation,
        provincesMap,
        guarantorNation,
        targetResolution.attackType,
        fleetCount,
        targetResolution.provinceId,
      );

    if (
      !optimalDeployment.isPossible ||
      optimalDeployment.winProbability <= 0 ||
      optimalDeployment.infantry <= 0
    ) {
      return null;
    }

    return ActionFactory.initiateBattle(
      nation.id,
      targetNation.id,
      optimalDeployment.drones,
      optimalDeployment.infantry,
      optimalDeployment.armor,
      optimalDeployment.airForce,
      targetResolution.provinceId,
      targetResolution.attackType,
    );
  }

  private static resolveActiveWarTarget(
    nation: Nation,
    allNations: Record<string, Nation>,
    currentTurn?: number,
  ): Nation | null {
    if (nation.warFocusTargetId) {
      const canonicalFocusId = CountryRegistry.resolveCanonicalId(
        nation.warFocusTargetId,
      );
      const focusNation = NationGettersUtility.resolveNation(
        canonicalFocusId,
        allNations,
      );

      if (focusNation && focusNation.isAlive) {
        const rel =
          nation.relations[canonicalFocusId] ||
          nation.relations[nation.warFocusTargetId];
        if (rel?.stance === "WAR") {
          if (
            currentTurn === undefined ||
            rel.warDeclaredTurn === undefined ||
            currentTurn > rel.warDeclaredTurn
          ) {
            return focusNation;
          }
        }
      }
    }

    for (const [targetId, rel] of Object.entries(nation.relations || {})) {
      if (rel.stance === "WAR") {
        if (
          currentTurn !== undefined &&
          rel.warDeclaredTurn !== undefined &&
          currentTurn <= rel.warDeclaredTurn
        ) {
          continue;
        }

        const canonicalTargetId = CountryRegistry.resolveCanonicalId(targetId);
        const targetNation = NationGettersUtility.resolveNation(
          canonicalTargetId,
          allNations,
        );
        if (
          targetNation &&
          targetNation.isAlive &&
          targetNation.id !== nation.id
        ) {
          return targetNation;
        }
      }
    }

    return null;
  }

  private static resolveTargetProvince(
    nation: Nation,
    targetNation: Nation,
    provincesMap: Record<string, Province> | undefined,
    ownedProvinces?: Province[],
  ): { provinceId: number; attackType: "LAND" | "NAVAL" } | null {
    if (!provincesMap) {
      return null;
    }

    const targetProvinceList = NationGettersUtility.getOwnedProvinces(
      targetNation.id,
      provincesMap,
    );

    if (targetProvinceList.length === 0) {
      return null;
    }

    for (let i = 0; i < targetProvinceList.length; i++) {
      const prov = targetProvinceList[i]!;
      if (
        LandNeighborResolver.hasProvinceLandBorder(
          prov.provinceId,
          nation.id,
          provincesMap,
        )
      ) {
        return {
          provinceId: prov.provinceId,
          attackType: "LAND",
        };
      }
    }

    const sourceSea = NationGettersUtility.hasSeaAccess(
      nation.id,
      provincesMap,
      ownedProvinces,
    );

    const hasNavalFleets = (nation.navalFleet || 0) > 0;
    if (!sourceSea || !hasNavalFleets) {
      return null;
    }

    for (let i = 0; i < targetProvinceList.length; i++) {
      const prov = targetProvinceList[i]!;
      if (prov.hasSeaAccess) {
        return {
          provinceId: prov.provinceId,
          attackType: "NAVAL",
        };
      }
    }

    return null;
  }
}
