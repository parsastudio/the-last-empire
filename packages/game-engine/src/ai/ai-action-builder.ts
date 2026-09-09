import { GameAction, Nation } from "@geopolitics/domain";
import { AIProcurementPlanner } from "@/engine/ai/ai-procurement-planner";
import { AIUpgradePlanner } from "@/engine/ai/ai-upgrade-planner";
import { AIEspionagePlanner } from "@/engine/ai/ai-espionage-planner";
import { AIAttackPlanner } from "@/engine/ai/ai-attack-planner";
import { AIPeaceEvaluator } from "@/engine/ai/ai-peace-evaluator";
import { AITreatyEvaluator } from "@/engine/ai/ai-treaty-evaluator";
import { AIEconomicDiplomacyEvaluator } from "@/engine/ai/ai-economic-diplomacy-evaluator";
import { AIWarDeclarationEvaluator } from "@/engine/ai/ai-war-declaration-evaluator";
import { AIEconomicStanceEvaluator } from "@/engine/ai/ai-economic-stance-evaluator";
import { AINationalProjectPlanner } from "@/engine/ai/ai-national-project-planner";
import { AiBudgetBlackboard } from "@/engine/ai/blackboard/ai-budget-blackboard";
import { TurnContext } from "@/engine/pipeline/turn-context";

export class AIActionBuilder {
  public static buildNationActions(
    nation: Nation,
    context: TurnContext,
  ): GameAction[] {
    const actions: GameAction[] = [];
    let currentNation = nation;

    const stanceAction = AIEconomicStanceEvaluator.evaluateBestStance(
      currentNation,
      context,
    );

    if (stanceAction) {
      actions.push(stanceAction);
      if (stanceAction.type === "SET_ECONOMIC_DOCTRINE") {
        currentNation = {
          ...currentNation,
          economicStance: stanceAction.stance,
        };
      }
    }

    const blackboard = AiBudgetBlackboard.createForNation(
      currentNation,
      context,
    );
    const allocated = blackboard.getWallets();

    const militaryProcurementWallet = {
      innovation: 0,
      globalMarket: Math.floor(allocated.militaryProcurement * 0.5),
      domesticInfra: Math.floor(allocated.militaryProcurement * 0.5),
      geopolitics: 0,
      totalDisposable: allocated.militaryProcurement,
      isEmbargoed: allocated.isEmbargoed,
      posture: allocated.posture,
    };

    const procurementResult = AIProcurementPlanner.planRecruitment(
      currentNation,
      context,
      allocated.militaryProcurement,
      militaryProcurementWallet,
    );
    actions.push(...procurementResult.actions);
    const unspentProcurement = procurementResult.remainingTreasury;
    blackboard.releaseSpillover("militaryProcurement", unspentProcurement);

    const upgradeWallets = {
      innovation: allocated.innovation,
      globalMarket: Math.floor(allocated.infrastructure * 0.4),
      domesticInfra: Math.floor(allocated.infrastructure * 0.6),
      geopolitics: 0,
      totalDisposable: allocated.infrastructure + allocated.innovation,
      isEmbargoed: allocated.isEmbargoed,
      posture: allocated.posture,
    };

    const upgradeResult = AIUpgradePlanner.planUpgrades(
      currentNation,
      context,
      allocated.infrastructure + allocated.innovation,
      upgradeWallets,
    );
    actions.push(...upgradeResult.actions);
    const unspentUpgrade = upgradeResult.remainingTreasury;
    blackboard.releaseSpillover("infrastructure", unspentUpgrade);

    const freshWallets = blackboard.getWallets();
    const projectResult = AINationalProjectPlanner.planProjects(
      currentNation,
      context,
      freshWallets.nationalProjects,
    );
    actions.push(...projectResult.actions);
    const unspentProjects =
      freshWallets.nationalProjects - projectResult.spentMoney;
    blackboard.releaseSpillover("nationalProjects", unspentProjects);

    const postProjectWallets = blackboard.getWallets();
    const espionageResult = AIEspionagePlanner.planEspionage(
      currentNation,
      context,
      postProjectWallets.geopolitics,
      postProjectWallets.geopolitics,
    );
    actions.push(...espionageResult.actions);
    const remainingGeoBudget = espionageResult.remainingGeopoliticsBudget;

    const attackAction = AIAttackPlanner.planAttack(currentNation, context);
    if (attackAction) {
      actions.push(attackAction);
    }

    this.appendDiplomaticAndWarActions(
      currentNation,
      context,
      actions,
      remainingGeoBudget,
      currentNation.treasury,
    );

    return actions;
  }

  private static appendDiplomaticAndWarActions(
    nation: Nation,
    context: TurnContext,
    actions: GameAction[],
    geopoliticsBudget: number,
    availableTreasury: number,
  ): void {
    let currentGeoBudget = geopoliticsBudget;
    let currentTreasury = availableTreasury;

    let aidedTargetId: string | null = null;
    const aidResult = AIEconomicDiplomacyEvaluator.evaluate(
      nation,
      context,
      currentGeoBudget,
      currentTreasury,
    );

    if (aidResult) {
      actions.push(aidResult.action);
      currentGeoBudget -= aidResult.cost;
      currentTreasury -= aidResult.cost;
      if ("targetNationId" in aidResult.action) {
        aidedTargetId = aidResult.action.targetNationId;
      }
    }

    const peaceAction = AIPeaceEvaluator.evaluate(nation, context);

    if (peaceAction) {
      actions.push(peaceAction);
      return;
    }

    const cancelAction = AITreatyEvaluator.evaluateTreatyCancellation(
      nation,
      context,
    );

    if (cancelAction) {
      actions.push(cancelAction);
      return;
    }

    const warDeclarationAction = AIWarDeclarationEvaluator.evaluate(
      nation,
      context,
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
      const treatyAction = AITreatyEvaluator.evaluate(nation, context);

      if (treatyAction) {
        actions.push(treatyAction);
      }
    }
  }
}
