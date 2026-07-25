import { TurnPhase } from "@/engine/pipeline/turn-phase";
import { GridCombatPhase } from "@/engine/pipeline/grid-combat-phase";

export class PipelineIntegrationFacade {
  public injectGridCombatPhase(phases: TurnPhase[]): TurnPhase[] {
    const updated = [...phases];
    const index = updated.findIndex(
      (p) => p.constructor.name === "MilitaryPhase",
    );

    if (index > -1) {
      updated.splice(index + 1, 0, new GridCombatPhase());
    } else {
      updated.push(new GridCombatPhase());
    }

    return updated;
  }
}
