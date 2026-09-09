import {
  GameAction,
  ActionFactory,
  Nation,
  CountryRegistry,
  LandNeighborResolver,
  NationGettersUtility,
  TwmiCalculatorUtility,
  MapTopologyRegistry,
} from "@geopolitics/domain";
import { AttackDeploymentOptimizer } from "@/engine/combat/attack-deployment-optimizer";
import { NavalDeploymentClamper } from "@/engine/combat/optimizer/naval-deployment-clamper";
import { TurnContext } from "@/engine/pipeline/turn-context";

export class AIAttackPlanner {
  public static planAttack(
    nation: Nation,
    context: TurnContext,
  ): GameAction | null {
    if (!nation.isAlive || !nation.relations || !context.state.provinces) {
      return null;
    }

    const targetNation = this.resolveActiveWarTarget(
      nation,
      context.state.nations,
      context.turn,
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
      context,
    );

    if (!targetResolution) {
      return null;
    }

    const guarantorNation = targetNation.securityGuarantorId
      ? NationGettersUtility.resolveNation(
          targetNation.securityGuarantorId,
          context.state.nations,
        )
      : null;

    const fleetCount = nation.navalFleet || 0;

    const optimalDeployment =
      AttackDeploymentOptimizer.calculateOptimalDeployment(
        nation,
        targetNation,
        context.state.provinces,
        guarantorNation,
        targetResolution.attackType,
        fleetCount,
        targetResolution.provinceId,
      );

    if (
      optimalDeployment.isPossible &&
      optimalDeployment.winProbability > 0 &&
      optimalDeployment.infantry > 0
    ) {
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

    const sourceTwmi = TwmiCalculatorUtility.calculateTwmi(
      nation,
      context.state.nations,
      context.state.provinces,
    );
    const targetTwmi = TwmiCalculatorUtility.calculateTwmi(
      targetNation,
      context.state.nations,
      context.state.provinces,
    );

    if (sourceTwmi < targetTwmi) {
      return null;
    }

    const fullInfantry = nation.military.infantry || 0;
    const fullArmor = nation.military.armor || 0;
    const fullAirForce = nation.military.airForce || 0;
    const fullDrones = nation.military.droneMissile || 0;

    let deployInfantry = fullInfantry;
    let deployArmor = fullArmor;

    if (targetResolution.attackType === "NAVAL") {
      const clamped = NavalDeploymentClamper.clamp(
        fullInfantry,
        fullArmor,
        "NAVAL",
        fleetCount,
      );
      deployInfantry = clamped.inf;
      deployArmor = clamped.arm;
    }

    if (deployInfantry < 1) {
      return null;
    }

    return ActionFactory.initiateBattle(
      nation.id,
      targetNation.id,
      fullDrones,
      deployInfantry,
      deployArmor,
      fullAirForce,
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
    context: TurnContext,
  ): { provinceId: number; attackType: "LAND" | "NAVAL" } | null {
    const targetProvinceList = context.getOwnedProvinces(targetNation.id);

    if (targetProvinceList.length === 0) {
      return null;
    }

    for (let i = 0; i < targetProvinceList.length; i++) {
      const prov = targetProvinceList[i]!;
      if (
        LandNeighborResolver.hasProvinceLandBorder(
          prov.provinceId,
          nation.id,
          context.state.provinces,
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
      context.state.provinces,
    );

    const hasNavalFleets = (nation.navalFleet || 0) > 0;
    if (!sourceSea || !hasNavalFleets) {
      return null;
    }

    for (let i = 0; i < targetProvinceList.length; i++) {
      const prov = targetProvinceList[i]!;
      const hasSea = MapTopologyRegistry.hasSeaAccess(prov.provinceId, true);
      if (hasSea) {
        return {
          provinceId: prov.provinceId,
          attackType: "NAVAL",
        };
      }
    }

    return null;
  }
}
