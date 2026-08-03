import type { GameState } from "@/domain/game/game-state.schema";
import { CorruptionManager } from "@/engine/politics/corruption-manager";
import { TurnPhase, PipelineContext } from "@/engine/pipeline/turn-phase";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";
import { ResearchManager } from "@/engine/politics/research-manager";
import { DomesticCrisisManager } from "@/engine/politics/domestic-crisis-manager";

export class PoliticsPhase implements TurnPhase {
  private corruptionManager = new CorruptionManager();
  private stabilityCalc = new StabilityCalculator();
  private researchManager = new ResearchManager();
  private domesticCrisisManager = new DomesticCrisisManager();

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

      updated.government.corruption =
        this.corruptionManager.updateCorruptionLevel(updated);

      const newStability = this.stabilityCalc.calculateTurnStability(updated);
      updated.government = {
        ...updated.government,
        stability: newStability,
      };

      updated = this.researchManager.processTurnResearch(updated);

      const crisisResult =
        this.domesticCrisisManager.checkAndProcessCrisis(updated);
      updated = crisisResult.updatedNation;

      updated.government = {
        ...updated.government,
        turnsInPower: updated.government.turnsInPower + 1,
      };

      nations[id] = updated;
    }

    nextState.nations = nations;
    return nextState;
  }
}
