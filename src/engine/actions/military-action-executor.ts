import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { RecruitmentQueueManager } from "@/engine/military/recruitment-queue";
import { BattleExecutionEngine } from "@/engine/combat/battle-execution-engine";
import { NationIdResolver } from "@/domain/shared/domain-utilities";
import { ResearchManager } from "@/engine/politics/research-manager";

export class MilitaryActionExecutor {
  private static recruitmentManager = new RecruitmentQueueManager();
  private static battleEngine = new BattleExecutionEngine();
  private static researchManager = new ResearchManager();

  public static execute(state: GameState, action: GameAction): GameState {
    const canonicalSourceId = NationIdResolver.resolveCanonicalId(
      action.nationId,
    );
    const nation =
      state.nations[action.nationId] || state.nations[canonicalSourceId];
    if (!nation) return state;

    const sourceKey = nation.id;

    switch (action.type) {
      case "RECRUIT_UNIT":
        return {
          ...state,
          nations: {
            ...state.nations,
            [sourceKey]: this.recruitmentManager.enqueueOrder(
              nation,
              action.unitType,
              action.quantity,
            ),
          },
        };

      case "CANCEL_RECRUITMENT":
        return {
          ...state,
          nations: {
            ...state.nations,
            [sourceKey]: this.recruitmentManager.cancelOrder(
              nation,
              action.orderId,
            ),
          },
        };

      case "DISBAND_UNIT": {
        const military = { ...nation.military };
        if (action.unitType === "INFANTRY")
          military.infantry -= action.quantity;
        else if (action.unitType === "AIR_FORCE")
          military.airForce -= action.quantity;
        else if (action.unitType === "DRONE_MISSILE")
          military.droneMissile -= action.quantity;

        return {
          ...state,
          nations: {
            ...state.nations,
            [sourceKey]: {
              ...nation,
              military,
              resources: {
                ...nation.resources,
                manpower: nation.resources.manpower + action.quantity * 4,
              },
            },
          },
        };
      }

      case "INVEST_RESEARCH": {
        return {
          ...state,
          nations: {
            ...state.nations,
            [sourceKey]: this.researchManager.investInMilitaryTech(nation),
          },
        };
      }

      case "INITIATE_BATTLE": {
        return this.battleEngine.executeBattle(state, action);
      }

      default:
        return state;
    }
  }
}
