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
import { AiWalletBudgetAllocator } from "@/engine/ai/procurement/ai-wallet-budget-allocator";
import { AINationalProjectPlanner } from "@/engine/ai/ai-national-project-planner";
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

    const posture = context.getPosture(currentNation);
    const wallets = AiWalletBudgetAllocator.calculateWallets(
      currentNation,
      context.state.nations,
      context.state.provinces,
      posture,
      undefined,
      context.gdpMap,
      context.totalWorldGdp,
    );

    const procurementResult = AIProcurementPlanner.planRecruitment(
      currentNation,
      context,
      undefined,
      wallets,
    );
    actions.push(...procurementResult.actions);

    const upgradeResult = AIUpgradePlanner.planUpgrades(
      currentNation,
      context,
      procurementResult.remainingTreasury,
      procurementResult.strategicWallets,
    );
    actions.push(...upgradeResult.actions);

    const projectResult = AINationalProjectPlanner.planProjects(
      currentNation,
      context,
      upgradeResult.remainingTreasury,
    );
    actions.push(...projectResult.actions);

    const treasuryAfterProjects =
      upgradeResult.remainingTreasury - projectResult.spentMoney;

    const espionageResult = AIEspionagePlanner.planEspionage(
      currentNation,
      context,
      procurementResult.strategicWallets.geopolitics,
      treasuryAfterProjects,
    );
    actions.push(...espionageResult.actions);

    const attackAction = AIAttackPlanner.planAttack(currentNation, context);
    if (attackAction) {
      actions.push(attackAction);
    }

    this.appendDiplomaticAndWarActions(
      currentNation,
      context,
      actions,
      espionageResult.remainingGeopoliticsBudget,
      espionageResult.remainingTreasury,
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
