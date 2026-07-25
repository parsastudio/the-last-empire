import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { StateGridInjector } from "@/engine/combat/state/state-grid-injector";
import { PipelineIntegrationFacade } from "@/engine/combat/orchestrator/pipeline-integration-facade";
import { TurnPipeline } from "@/engine/turn-pipeline";

export class EngineIntegration {
  private injector = new StateGridInjector();
  private pipelineFacade = new PipelineIntegrationFacade();

  public bootstrapEngineState(
    state: GameState,
    gridState: GridState,
  ): GameState {
    return this.injector.injectGridState(state, gridState);
  }

  public integrateTurnPipeline(pipeline: TurnPipeline): TurnPipeline {
    const currentPhases = (pipeline as { phases?: unknown }).phases;
    if (Array.isArray(currentPhases)) {
      const updatedPhases =
        this.pipelineFacade.injectGridCombatPhase(currentPhases);
      (pipeline as { phases: unknown }).phases = updatedPhases;
    }
    return pipeline;
  }
}
