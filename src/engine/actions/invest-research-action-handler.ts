import type { GameState } from "@/domain/game/game-state.schema";
import type { GameAction } from "@/domain/game/action.schema";
import { ResearchDevelopmentManager } from "@/engine/military/research-development-manager";
import type { ActionHandler } from "./action-handler";

export class InvestResearchActionHandler implements ActionHandler {
  private researchManager = new ResearchDevelopmentManager();

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "INVEST_RESEARCH") {
      return state;
    }
    const nation = state.nations[action.nationId];
    if (!nation) {
      return state;
    }
    return {
      ...state,
      nations: {
        ...state.nations,
        [action.nationId]: this.researchManager.investInResearch(nation),
      },
    };
  }
}
