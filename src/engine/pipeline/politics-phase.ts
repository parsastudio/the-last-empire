import type { GameState } from "@/domain/game/game-state.schema";
import { CorruptionManager } from "@/engine/politics/corruption-manager";
import { TurnPhase, PipelineContext } from "@/engine/pipeline/turn-phase";
import { ProxyImpactHandler } from "./politics/proxy-impact-handler";
import { StabilityDoctrinesHandler } from "./politics/stability-doctrines-handler";
import { ElectionCrisisHandler } from "./politics/election-crisis-handler";

export class PoliticsPhase implements TurnPhase {
  private corruptionManager = new CorruptionManager();
  private proxyImpactHandler = new ProxyImpactHandler();
  private stabilityDoctrinesHandler = new StabilityDoctrinesHandler();
  private electionCrisisHandler = new ElectionCrisisHandler();

  public execute(context: PipelineContext): GameState {
    const nextState = { ...context.state };
    const nations = { ...nextState.nations };

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      let updated = {
        ...nation,
        government: {
          ...nation.government,
        },
      };

      const proxyResult = this.proxyImpactHandler.handle(id, updated, nations);
      updated = proxyResult.updated;

      if (proxyResult.coupTriggered) {
        for (const otherId of Object.keys(nations)) {
          if (nations[otherId]?.proxyInfluenceBudget) {
            nations[otherId].proxyInfluenceBudget[id] = 0;
          }
        }
      }

      updated.government.corruption =
        this.corruptionManager.updateCorruptionLevel(updated);

      updated = this.stabilityDoctrinesHandler.handle(updated);

      const crisisResult = this.electionCrisisHandler.handle(
        updated,
        nextState.currentTurn,
        context.prng.nextInt(1, 1000000),
      );
      updated = crisisResult.updated;

      if (crisisResult.coupOrCrisisTriggered) {
        for (const otherId of Object.keys(nations)) {
          if (nations[otherId]?.proxyInfluenceBudget) {
            nations[otherId].proxyInfluenceBudget[id] = 0;
          }
        }
      }

      updated.government = {
        ...updated.government,
        turnsInPower: updated.government.turnsInPower + 1,
      };

      const updatedBudgets = { ...updated.proxyInfluenceBudget };
      for (const targetId of Object.keys(updatedBudgets)) {
        updatedBudgets[targetId] = Math.max(
          0,
          Math.floor(updatedBudgets[targetId] * 0.75),
        );
      }
      updated.proxyInfluenceBudget = updatedBudgets;

      nations[id] = updated;
    }

    nextState.nations = nations;
    return nextState;
  }
}
