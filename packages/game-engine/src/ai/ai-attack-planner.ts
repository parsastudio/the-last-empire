import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  CountryRegistry,
  LandNeighborResolver,
  NationGettersUtility,
} from "@geopolitics/domain";
import { NavalDeploymentClamper } from "@/engine/combat/optimizer/naval-deployment-clamper";

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

    const activeWarCount = this.countActiveWars(nation, allNations);
    const deployRatio = activeWarCount > 1 ? 0.65 : 0.9;

    const availableArmor = nation.military.armor || 0;
    const availableAirForce = nation.military.airForce || 0;
    const availableDrones = nation.military.droneMissile || 0;

    let infantryToDeploy = Math.max(
      1,
      Math.min(availableInfantry, Math.ceil(availableInfantry * deployRatio)),
    );
    let armorToDeploy = Math.min(
      availableArmor,
      Math.ceil(availableArmor * deployRatio),
    );
    const airForceToDeploy = Math.min(
      availableAirForce,
      Math.ceil(availableAirForce * deployRatio),
    );
    const dronesToLaunch = Math.min(
      availableDrones,
      Math.ceil(availableDrones * deployRatio),
    );

    if (targetResolution.attackType === "NAVAL") {
      const fleetCount = nation.navalFleet || 0;
      if (fleetCount <= 0) {
        return null;
      }

      const clamped = NavalDeploymentClamper.clamp(
        infantryToDeploy,
        armorToDeploy,
        "NAVAL",
        fleetCount,
      );

      infantryToDeploy = clamped.inf;
      armorToDeploy = clamped.arm;
    }

    return ActionFactory.initiateBattle(
      nation.id,
      targetNation.id,
      dronesToLaunch,
      infantryToDeploy,
      armorToDeploy,
      airForceToDeploy,
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

  private static countActiveWars(
    nation: Nation,
    allNations: Record<string, Nation>,
  ): number {
    let count = 0;
    for (const [targetId, rel] of Object.entries(nation.relations || {})) {
      if (rel.stance === "WAR") {
        const canonical = CountryRegistry.resolveCanonicalId(targetId);
        const target = NationGettersUtility.resolveNation(
          canonical,
          allNations,
        );
        if (target && target.isAlive && target.id !== nation.id) {
          count++;
        }
      }
    }
    return count;
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
