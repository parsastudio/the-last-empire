import type { GameState } from "@/domain/game/game-state.schema";
import { GlobalIntelligenceUpdater } from "@/engine/diplomacy/global-intelligence-updater";
import { PowerScoreRanker } from "@/engine/diplomacy/power-score-ranker";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { CoalitionManager } from "@/engine/diplomacy/coalition-manager";
import { TurnPhase, PipelineContext } from "@/engine/pipeline/turn-phase";
import { ReputationDecayHandler } from "./diplomacy/reputation-decay-handler";
import { OpinionFrictionHandler } from "./diplomacy/opinion-friction-handler";

export class DiplomacyPhase implements TurnPhase {
  private intelligenceUpdater = new GlobalIntelligenceUpdater();
  private powerRanker = new PowerScoreRanker();
  private governmentSystem = new GovernmentSystem();
  private coalitionManager = new CoalitionManager();
  private reputationDecayHandler = new ReputationDecayHandler();
  private opinionFrictionHandler = new OpinionFrictionHandler();

  public execute(context: PipelineContext): GameState {
    let nextState = { ...context.state };
    const nations = { ...nextState.nations };

    const rawNationsList = Object.values(nations)
      .filter((n) => n.isAlive)
      .map((n) => {
        const govTraits = this.governmentSystem.getTraits(n.government.type);
        return {
          id: n.id,
          gdp: n.gdp,
          treasury: n.treasury,
          infantry: n.military.infantry,
          airForce: n.military.airForce,
          drone: n.military.droneMissile,
          techLevel: n.military.techLevel,
          militaryPowerMultiplier: govTraits.militaryPowerMultiplier,
        };
      });

    this.powerRanker.rankNations(rawNationsList);

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      let updated = this.intelligenceUpdater.updatePassiveIntel(
        nation,
        nations,
      );

      updated = this.reputationDecayHandler.handle(updated);
      updated = this.opinionFrictionHandler.handle(updated, nations);

      nations[id] = updated;
    }

    nextState.nations = nations;
    nextState = this.coalitionManager.processCoalitions(nextState);

    return nextState;
  }
}
