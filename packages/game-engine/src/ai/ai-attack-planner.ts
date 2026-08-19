import { GameAction } from "@/domain/game/action.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { GOVERNMENT_TRAITS_MAP } from "@/domain/politics/government-traits.config";
import { MilitaryPowerCalculator } from "@/domain/military/military-power-calculator.utility";
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";
import { NavalNeighborResolver } from "@/domain/map/naval-neighbor-resolver";

export class AIAttackPlanner {
  public static planAttack(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): GameAction | null {
    if (!nation.isAlive || !nation.relations) {
      return null;
    }

    const targetNation = this.resolveActiveWarTarget(nation, allNations);
    if (!targetNation || !targetNation.isAlive) {
      return null;
    }

    const activeWarCount = this.countActiveWars(nation, allNations);
    const deployRatio = activeWarCount > 1 ? 0.5 : 0.75;

    const availableInfantry = nation.military.infantry || 0;
    const availableArmor = nation.military.armor || 0;
    const availableAirForce = nation.military.airForce || 0;
    const availableDrones = nation.military.droneMissile || 0;

    const infantryToDeploy = Math.floor(availableInfantry * deployRatio);
    const armorToDeploy = Math.floor(availableArmor * deployRatio);
    const airForceToDeploy = Math.floor(availableAirForce * deployRatio);
    const dronesToLaunch = Math.floor(availableDrones * deployRatio);

    if (infantryToDeploy < 1) {
      return null;
    }

    const targetResolution = this.resolveTargetProvince(
      nation,
      targetNation,
      provincesMap,
      infantryToDeploy,
      armorToDeploy,
      airForceToDeploy,
      dronesToLaunch,
    );

    if (!targetResolution) {
      return null;
    }

    const deployedPower = this.calculateDeployedPower(
      nation,
      infantryToDeploy,
      armorToDeploy,
      airForceToDeploy,
      dronesToLaunch,
      targetResolution.attackType,
    );

    const targetPower = Math.max(
      1,
      MilitaryPowerCalculator.calculateEffectivePower(targetNation),
    );

    if (deployedPower / targetPower < 1.3) {
      return null;
    }

    const totalForceCost =
      infantryToDeploy * MILITARY_UNIT_STATS.INFANTRY.moneyCost +
      armorToDeploy * MILITARY_UNIT_STATS.ARMOR.moneyCost +
      airForceToDeploy * MILITARY_UNIT_STATS.AIR_FORCE.moneyCost +
      dronesToLaunch * MILITARY_UNIT_STATS.DRONE_MISSILE.moneyCost;

    const deploymentCost =
      targetResolution.attackType === "LAND"
        ? Math.floor(totalForceCost * 0.05)
        : targetResolution.navalDeploymentCost;

    if (nation.treasury < deploymentCost) {
      return null;
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
  ): Nation | null {
    if (nation.warFocusTargetId) {
      const canonicalFocusId = CountryRegistry.resolveCanonicalId(
        nation.warFocusTargetId,
      );
      const focusNation =
        allNations[canonicalFocusId] || allNations[nation.warFocusTargetId];

      if (focusNation && focusNation.isAlive) {
        const rel =
          nation.relations[canonicalFocusId] ||
          nation.relations[nation.warFocusTargetId];
        if (rel?.stance === "WAR") {
          return focusNation;
        }
      }
    }

    for (const [targetId, rel] of Object.entries(nation.relations || {})) {
      if (rel.stance === "WAR") {
        const canonicalTargetId = CountryRegistry.resolveCanonicalId(targetId);
        const targetNation =
          allNations[canonicalTargetId] || allNations[targetId];
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
        const target = allNations[canonical] || allNations[targetId];
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
    infantry: number,
    armor: number,
    airForce: number,
    drones: number,
  ): {
    provinceId: number;
    attackType: "LAND" | "NAVAL";
    navalDeploymentCost: number;
  } | null {
    if (!provincesMap) {
      return null;
    }

    const cleanTargetId = CountryRegistry.resolveCanonicalId(targetNation.id);
    const targetProvinceList = Object.values(provincesMap).filter(
      (p) =>
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === cleanTargetId,
    );

    if (targetProvinceList.length === 0) {
      return null;
    }

    for (const prov of targetProvinceList) {
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
          navalDeploymentCost: 0,
        };
      }
    }

    if (
      !nation.geography.hasSeaAccess ||
      !targetNation.geography.hasSeaAccess
    ) {
      return null;
    }

    let bestNavalProv: Province | null = null;
    let minNavalCost = Infinity;

    for (const prov of targetProvinceList) {
      if (!prov.hasSeaAccess) continue;

      const navalInfo = NavalNeighborResolver.resolveNavalAttack(
        prov.provinceId,
        nation.id,
        provincesMap,
        infantry,
        armor,
        airForce,
        drones,
      );

      if (
        navalInfo.isNavalValid &&
        navalInfo.deploymentMoneyCost < minNavalCost
      ) {
        minNavalCost = navalInfo.deploymentMoneyCost;
        bestNavalProv = prov;
      }
    }

    if (bestNavalProv) {
      return {
        provinceId: bestNavalProv.provinceId,
        attackType: "NAVAL",
        navalDeploymentCost: minNavalCost,
      };
    }

    return null;
  }

  private static calculateDeployedPower(
    nation: Nation,
    infantry: number,
    armor: number,
    airForce: number,
    drones: number,
    attackType: "LAND" | "NAVAL",
  ): number {
    const navalPower =
      attackType === "NAVAL"
        ? (nation.military.navalFleet || 0) *
          MILITARY_UNIT_STATS.NAVAL_FLEET.weightPower
        : 0;

    const rawPower =
      infantry * MILITARY_UNIT_STATS.INFANTRY.weightPower +
      armor * MILITARY_UNIT_STATS.ARMOR.weightPower +
      airForce * MILITARY_UNIT_STATS.AIR_FORCE.weightPower +
      drones * MILITARY_UNIT_STATS.DRONE_MISSILE.weightPower +
      navalPower;

    const techLevel = Math.max(1, nation.military.techLevel || 1);
    const techMult = 1 + (techLevel - 1) * 0.5;
    const govTraits = GOVERNMENT_TRAITS_MAP[nation.government.type];

    return Math.floor(rawPower * techMult * govTraits.militaryPowerMultiplier);
  }
}
