import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type { GameAction } from "@/modules/game-engine/schemas/action.schema";
import { ResearchDevelopmentManager } from "@/modules/military/domain/research-development-manager";
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
