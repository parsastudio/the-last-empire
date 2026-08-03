import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { RecruitmentQueueManager } from "@/engine/military/recruitment-queue";
import { BattleExecutionEngine } from "@/engine/combat/battle-execution-engine";
import { GridState } from "@/engine/combat/state/grid-state";
import { NationIdResolver } from "@/domain/shared/domain-utilities";

export class MilitaryActionExecutor {
  private static recruitmentManager = new RecruitmentQueueManager();
  private static battleEngine = new BattleExecutionEngine();

  public static execute(
    state: GameState,
    action: GameAction,
    gridState?: GridState,
  ): GameState {
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
        const cost = Math.max(1500000000, Math.floor(nation.gdp * 0.12));
        if (nation.treasury < cost) return state;
        return {
          ...state,
          nations: {
            ...state.nations,
            [sourceKey]: {
              ...nation,
              treasury: nation.treasury - cost,
              military: {
                ...nation.military,
                techLevel: nation.military.techLevel + 1,
              },
            },
          },
        };
      }

      case "INITIATE_BATTLE": {
        if (!gridState) return state;
        return this.battleEngine.executeBattle(state, action, gridState);
      }

      default:
        return state;
    }
  }
}
