import { GameAction } from "@/domain/game/action.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";
import { NavalNeighborResolver } from "@/domain/map/naval-neighbor-resolver";
import { AIProcurementPlanner } from "@/engine/ai/ai-procurement-planner";
import { AIUpgradePlanner } from "@/engine/ai/ai-upgrade-planner";
import { AIEspionagePlanner } from "@/engine/ai/ai-espionage-planner";
import { AIPeaceEvaluator } from "@/engine/ai/ai-peace-evaluator";
import { AITreatyEvaluator } from "@/engine/ai/ai-treaty-evaluator";
import { AIEconomicDiplomacyEvaluator } from "@/engine/ai/ai-economic-diplomacy-evaluator";
import { AIWarDeclarationEvaluator } from "@/engine/ai/ai-war-declaration-evaluator";

export class AIActionBuilder {
  public static buildNationActions(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): GameAction[] {
    const actions: GameAction[] = [];

    const procurementResult = AIProcurementPlanner.planRecruitment(
      nation,
      allNations,
      provincesMap,
    );
    actions.push(...procurementResult.actions);

    const upgradeResult = AIUpgradePlanner.planUpgrades(
      nation,
      allNations,
      provincesMap,
      procurementResult.remainingTreasury,
    );
    actions.push(...upgradeResult.actions);

    const espionageResult = AIEspionagePlanner.planEspionage(
      nation,
      allNations,
      provincesMap,
      upgradeResult.remainingTreasury,
    );
    actions.push(...espionageResult.actions);

    this.appendDiplomaticAndWarActions(
      nation,
      allNations,
      provincesMap,
      actions,
      espionageResult.remainingTreasury,
    );

    return actions;
  }

  private static appendDiplomaticAndWarActions(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap: Record<string, Province> | undefined,
    actions: GameAction[],
    availableTreasury?: number,
  ): void {
    let currentTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;

    let aidedTargetId: string | null = null;
    const aidResult = AIEconomicDiplomacyEvaluator.evaluate(
      nation,
      allNations,
      provincesMap,
      currentTreasury,
    );

    if (aidResult) {
      actions.push(aidResult.action);
      currentTreasury -= aidResult.cost;
      if ("targetNationId" in aidResult.action) {
        aidedTargetId = aidResult.action.targetNationId;
      }
    }

    const peaceAction = AIPeaceEvaluator.evaluate(
      nation,
      allNations,
      provincesMap,
    );

    if (peaceAction) {
      actions.push(peaceAction);
      return;
    }

    const warDeclarationAction = AIWarDeclarationEvaluator.evaluate(
      nation,
      allNations,
      provincesMap,
    );

    if (warDeclarationAction) {
      const warTargetId =
        "targetNationId" in warDeclarationAction
          ? warDeclarationAction.targetNationId
          : null;

      if (!aidedTargetId || warTargetId !== aidedTargetId) {
        actions.push(warDeclarationAction);
      }
    } else {
      const treatyAction = AITreatyEvaluator.evaluate(
        nation,
        allNations,
        provincesMap,
      );

      if (treatyAction) {
        actions.push(treatyAction);
      }
    }

    const activeWarTarget = nation.warFocusTargetId
      ? allNations[nation.warFocusTargetId] ||
        allNations[CountryRegistry.resolveCanonicalId(nation.warFocusTargetId)]
      : null;

    if (activeWarTarget && activeWarTarget.isAlive) {
      const attackAction = this.planAttack(
        nation,
        activeWarTarget,
        provincesMap,
      );
      if (attackAction) {
        actions.push(attackAction);
        return;
      }
    }

    for (const [targetId, rel] of Object.entries(nation.relations || {})) {
      if (actions.length >= 6) break;
      const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);
      const target = allNations[targetId] || allNations[canonicalTarget];
      if (!target || !target.isAlive || target.id === nation.id) continue;

      if (rel.stance === "WAR") {
        const attackAction = this.planAttack(nation, target, provincesMap);
        if (attackAction) {
          actions.push(attackAction);
          return;
        }
      }
    }
  }

  private static planAttack(
    attacker: Nation,
    defender: Nation,
    provincesMap?: Record<string, Province>,
  ): GameAction | null {
    if (attacker.military.infantry <= 1) return null;

    let targetProvId: number | undefined = undefined;
    let attackType: "LAND" | "NAVAL" = "LAND";

    if (
      provincesMap &&
      defender.provinceIds &&
      defender.provinceIds.length > 0
    ) {
      for (const pid of defender.provinceIds) {
        if (
          LandNeighborResolver.hasProvinceLandBorder(
            pid,
            attacker.id,
            provincesMap,
          )
        ) {
          targetProvId = pid;
          attackType = "LAND";
          break;
        }
      }

      if (!targetProvId && attacker.geography.hasSeaAccess) {
        for (const pid of defender.provinceIds) {
          const navalInfo = NavalNeighborResolver.resolveNavalAttack(
            pid,
            attacker.id,
            provincesMap,
            1,
            0,
            0,
            0,
          );
          if (navalInfo.isNavalValid) {
            targetProvId = pid;
            attackType = "NAVAL";
            break;
          }
        }
      }
    }

    const infToDeploy = Math.max(
      1,
      Math.floor(attacker.military.infantry * 0.7),
    );
    const armToDeploy = Math.floor((attacker.military.armor || 0) * 0.7);
    const airToDeploy = Math.floor(attacker.military.airForce * 0.7);
    const dronesToLaunch = Math.min(2, attacker.military.droneMissile);

    return ActionFactory.initiateBattle(
      attacker.id,
      defender.id,
      dronesToLaunch,
      infToDeploy,
      armToDeploy,
      airToDeploy,
      targetProvId,
      attackType,
    );
  }
}
